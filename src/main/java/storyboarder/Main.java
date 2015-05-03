package storyboarder;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

/**
 * Hosts a Storyboarder project. Runs a {@link GUI} server and a
 * {@link Multiplayer} server.
 *
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

  private Main() {
    String message = "This class cannot have instances.";
    throw new UnsupportedOperationException(message);
  }

  /**
   * Entry point into the program. Starts a GUI server, and a Multiplayer
   * server.
   *
   * @param args
   *          String array, can be used to set custom ports for both servers.
   */
  public static void main(String[] args) {

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

    GUI.start(sparkPort);

    int socketPort = DEFAULT_SOCKET_PORT;
    if (options.has(socketSpec)) {
      socketPort = options.valueOf(socketSpec);
    }
    Multiplayer server = new Multiplayer(socketPort);
    server.start();

  }
}
