import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.requests.GatewayIntent;
import org.json.JSONObject;
import org.json.JSONArray;

import javax.security.auth.login.LoginException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) throws Exception {
        String content = new String(Files.readAllBytes(Paths.get("config.json")));
        JSONObject config = new JSONObject(content);

        String token = config.getString("token");

        JDABuilder builder = JDABuilder.createDefault(token)
                .enableIntents(GatewayIntent.MESSAGE_CONTENT, GatewayIntent.GUILD_MESSAGES, GatewayIntent.GUILD_MEMBERS)
                .setActivity(Activity.playing("Moderating chat"));

        builder.addEventListeners(new ModerationListener(config));
        builder.build();
    }
}