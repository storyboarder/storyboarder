package storyboarder;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

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

    /*
     * OptionParser parser = new OptionParser();
     * 
     * OptionSpec<String> loadSpec = parser.accepts(LOAD_FLAG).withRequiredArg()
     * .ofType(String.class);
     * 
     * OptionSpec<String> newProjectSpec = parser.accepts(NEW_PROJECT_FLAG)
     * .withRequiredArg().ofType(String.class);
     * 
     * OptionSpec<Integer> sparkSpec = parser.accepts(SPARK_PORT_FLAG)
     * .withRequiredArg().ofType(Integer.class);
     * 
     * OptionSpec<Integer> socketSpec = parser.accepts(SOCKET_PORT_FLAG)
     * .withRequiredArg().ofType(Integer.class);
     * 
     * OptionSet options = parser.parse(args);
     * 
     * if (options.has(loadSpec) && options.has(newProjectSpec)) {
     * exit("can't start a new project and load one at the same time."); }
     * 
     * int sparkPort = DEFAULT_SPARK_PORT; if (options.has(sparkSpec)) {
     * sparkPort = options.valueOf(sparkSpec); } StoryboarderGUI gui = new
     * StoryboarderGUI(sparkPort);
     * 
     * if (options.has(loadSpec)) { gui.loadProject(options.valueOf(loadSpec));
     * } else if (options.has(newProjectSpec)) {
     * gui.createProject(options.valueOf(newProjectSpec)); } else {
     * exit("specify whether to load or start a new project by using either " +
     * LOAD_FLAG + " or " + NEW_PROJECT_FLAG); }
     */
    StoryboarderProject project = new StoryboarderProject(args[0]);
    project.addPage("Hey derpmeister!");
    project.addPage("Hi!");
    project.savePage(0, "Hey El Duderino!");
    // StoryboarderGUI gui = new StoryboarderGUI(4567, project);
    // gui.start();

    // int socketPort = DEFAULT_SOCKET_PORT;
    // if (options.has(socketSpec)) {
    // socketPort = options.valueOf(socketSpec);
    // }
    // Multiplayer server = new Multiplayer(socketPort);
    // server.start();
    project.saveToDisk();
  }

}
