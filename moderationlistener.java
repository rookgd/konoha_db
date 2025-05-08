import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.*;

public class ModerationListener extends ListenerAdapter {
    private final List<String> badWords;
    private final Set<String> admins;
    private final Map<Long, Integer> warnCounts = new HashMap<>();

    public ModerationListener(JSONObject config) {
        badWords = new ArrayList<>();
        admins = new HashSet<>();
        JSONArray wordsArray = config.getJSONArray("bad_words");
        JSONArray adminsArray = config.getJSONArray("admins");

        for (int i = 0; i < wordsArray.length(); i++) {
            badWords.add(wordsArray.getString(i).toLowerCase());
        }
        for (int i = 0; i < adminsArray.length(); i++) {
            admins.add(adminsArray.getString(i));
        }
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (event.getAuthor().isBot()) return;

        String msg = event.getMessage().getContentRaw().toLowerCase();

        for (String badWord : badWords) {
            if (msg.contains(badWord)) {
                event.getMessage().delete().queue();
                long userId = event.getAuthor().getIdLong();
                warnCounts.put(userId, warnCounts.getOrDefault(userId, 0) + 1);
                event.getChannel().sendMessage("⚠️ " + event.getAuthor().getAsMention() +
                        ", your message contained bad words and was deleted. (Warning #" + warnCounts.get(userId) + ")").queue();
                return;
            }
        }

        if (msg.startsWith("!addbadword ")) {
            String authorId = event.getAuthor().getId();
            if (!admins.contains(authorId)) {
                event.getChannel().sendMessage("You're not allowed to use this command.").queue();
                return;
            }
            String word = msg.substring(13).trim();
            if (badWords.contains(word)) {
                event.getChannel().sendMessage("This word is already on the list.").queue();
            } else {
                badWords.add(word);
                event.getChannel().sendMessage("The word '" + word + "' has been added to the list.").queue();
            }
        }

        if (msg.equals("!warns")) {
            if (warnCounts.isEmpty()) {
                event.getChannel().sendMessage("Clean record!").queue();
                return;
            }
            StringBuilder sb = new StringBuilder("Warns:\n");
            warnCounts.forEach((id, count) -> {
                String userName = event.getJDA().getUserById(id) != null
                        ? event.getJDA().getUserById(id).getName()
                        : "User-ID: " + id;
                sb.append("- ").append(userName).append(": ").append(count).append("\n");
            });
            event.getChannel().sendMessage(sb.toString()).queue();
        }
    }
}