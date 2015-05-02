package storyboarder;

import java.io.IOException;
import java.net.UnknownHostException;
import java.nio.file.Path;
import java.nio.file.Paths;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

/**
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public final class Main {

  private static final String SPARK_PORT_FLAG = "port";

  private static final String SOCKET_PORT_FLAG = "socket";

  private static final int DEFAULT_SPARK_PORT = 4567;

  private static final int DEFAULT_SOCKET_PORT = 8888;

  private static final Path DEFAULT_DIRECTORY =
      Paths.get("projects/test_0.sqlite3");

  private Main() {
    throw new UnsupportedOperationException("This class cannot have instances.");
  }

  private static void exit(String message) {
    System.err.println("ERROR: " + message);
    System.exit(1);
  }

  public static void main(String[] args) throws IOException {

    OptionParser parser = new OptionParser();

    OptionSpec<Integer> sparkSpec = parser.accepts(SPARK_PORT_FLAG)
        .withRequiredArg().ofType(Integer.class);

    OptionSpec<Integer> socketSpec = parser.accepts(SOCKET_PORT_FLAG)
        .withRequiredArg().ofType(Integer.class);

    OptionSet options = parser.parse(args);

    int sparkPort = DEFAULT_SPARK_PORT;
    if (options.has(sparkSpec)) {
      sparkPort = options.valueOf(sparkSpec);
    }
    // try {
    // Project testProj = new Project(DEFAULT_DIRECTORY);
    GUI.start(sparkPort);
    // } catch (ClassNotFoundException | SQLException e1) {
    // // TODO Auto-generated catch block
    // e1.printStackTrace();
    // }

    try {
      int socketPort = DEFAULT_SOCKET_PORT;
      if (options.has(socketSpec)) {
        socketPort = options.valueOf(socketSpec);
      }
      Multiplayer server = new Multiplayer(socketPort);
      server.start();
    } catch (UnknownHostException e) {
      exit("could not start the multiplayer server: " + e.getMessage());
    }
  }
}
