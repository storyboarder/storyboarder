package storyboarder;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

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

  private static final String LOAD_FLAG = "load";

  private static final String NEW_PROJECT_FLAG = "create";

  private static final String SPARK_PORT_FLAG = "port";

  private static final String SOCKET_PORT_FLAG = "socket";

  private static final int DEFAULT_SPARK_PORT = 4567;

  private static final int DEFAULT_SOCKET_PORT = 8888;

  private Main() {
  }

  private static void exit(String message) {
    System.err.println("ERROR: " + message);
    System.exit(1);
  }

  public static void main(String[] args) throws UnsupportedEncodingException,
    FileNotFoundException, IOException {

    OptionParser parser = new OptionParser();

    OptionSpec<String> loadSpec = parser.accepts(LOAD_FLAG).withRequiredArg()
        .ofType(String.class);

    OptionSpec<String> newProjectSpec = parser.accepts(NEW_PROJECT_FLAG)
        .withRequiredArg().ofType(String.class);

    OptionSpec<Integer> sparkSpec = parser.accepts(SPARK_PORT_FLAG)
        .withRequiredArg().ofType(Integer.class);

    OptionSpec<Integer> socketSpec = parser.accepts(SOCKET_PORT_FLAG)
        .withRequiredArg().ofType(Integer.class);

    OptionSet options = parser.parse(args);

    if (options.has(loadSpec) && options.has(newProjectSpec)) {
      exit("can't start a new project and load one at the same time.");
    }

    int sparkPort = DEFAULT_SPARK_PORT;
    if (options.has(sparkSpec)) {
      sparkPort = options.valueOf(sparkSpec);
    }

    StoryboarderProject project = null;

    if (options.has(newProjectSpec)) {
      project = new StoryboarderProject(options.valueOf(newProjectSpec));
      project.create();
    } else if (options.has(loadSpec)) {
      project = new StoryboarderProject(options.valueOf(loadSpec));
      project.load();
    } else {
      exit("specify whether to load or create a project");
    }

    StoryboarderGUI gui = new StoryboarderGUI(sparkPort, project);

    gui.start();

    int socketPort = DEFAULT_SOCKET_PORT;
    if (options.has(socketSpec)) {
      socketPort = options.valueOf(socketSpec);
    }
    Multiplayer server = new Multiplayer(socketPort);
    server.start();
  }

}
