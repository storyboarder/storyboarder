package storyboarder;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import spark.ModelAndView;
import spark.QueryParamsMap;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import spark.TemplateViewRoute;
import spark.template.freemarker.FreeMarkerEngine;

/**
 * Handles all of the GUI stuff.
 *
 * @author fbystric
 * @author ktsakas
 * @author narobins
 * @author yz38
 *
 */
final class StoryboarderGUI {

  private static final int AUTO_SAVE_TIME = 60000;

  private static final String NULL_PROJ_MSG = "ERROR: Need to initialize the project!";

  private static final Path PROJECT_FOLDER = Paths.get("projects");

  private static final Gson GSON = new Gson();

  private final int port;

  private StoryboarderProject project;

  private List<Path> pathChoices = getPathChoices();

  StoryboarderGUI(int port, StoryboarderProject project) {
    this.port = port;
    this.project = project;
  }

  StoryboarderGUI(int port) {
    this.port = port;
  }

  void start() {
    Spark.setPort(port);
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/choices", new ProjectChoicesHandler());
    Spark.post("/loadProj", new LoadProjectHandler());
    Spark.post("/createProj", new CreateProjectHandler());

    // Spark.post("/init", new InitHandler());

    Spark.post("/load", new LoadHandler());
    Spark.post("/save", new SaveHandler());
    Spark.post("/quit", new QuitHandler());
  }

  void startAutoSave() {
    TimerTask saveTask = new TimerTask() {
      @Override
      public void run() {
        saveToDisk();
      }
    };
    Timer saveTimer = new Timer();
    saveTimer.scheduleAtFixedRate(saveTask, 0, AUTO_SAVE_TIME);
  }

  String saveToDisk() {
    if (project != null) {
      System.out.println("Saving to disk...");
      try {
        project.saveToDisk();
      } catch (IOException e) {
        String msg = "ERROR: saving: " + e.getMessage();
        System.err.println(msg);
        return msg;
      }
    } else {
      System.err.println(NULL_PROJ_MSG);
      return NULL_PROJ_MSG;
    }
    return "success saving to disk!";
  }

  String quit() {
    try {
      project.saveToDisk();
      Spark.stop();
      return "success quitting!";
    } catch (IOException e) {
      return "failure quitting!";
    }
  }

  private static List<Path> getPathChoices() {
    try {
      Files.createDirectories(PROJECT_FOLDER);
    } catch (IOException e) {
      System.err.println("ERROR: error creating necessary directories: "
          + e.getMessage());
    }
    List<Path> pathChoices = new ArrayList<Path>();

    try (DirectoryStream<Path> choicesStream = Files
        .newDirectoryStream(PROJECT_FOLDER)) {
      Iterator<Path> choicesIterator = choicesStream.iterator();

      while (choicesIterator.hasNext()) {
        pathChoices.add(choicesIterator.next());
      }
      System.out.println(pathChoices);
    } catch (IOException e) {
      System.err.println("ERROR: error getting possible projects: "
          + e.getMessage());
    }
    return pathChoices;

  }

  /**
   * Sends set up data to the spark site.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   *
   */
  private static class Setup implements TemplateViewRoute {

    @Override
    public ModelAndView handle(Request arg0, Response arg1) {
      Map<String, Object> variables = ImmutableMap.of("title", "Storyboarder");
      return new ModelAndView(variables, "main.ftl");
    }
  }

  /**
   * Sends a list of existing projects (in the projects directory) to the spark
   * server. Does not need any parameters.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private class ProjectChoicesHandler implements Route {
    @Override
    public Object handle(Request req, Response res) {
      List<String> names = new ArrayList<String>();
      for (Path choice : pathChoices) {
        names.add(choice.getName(choice.getNameCount() - 1).toString());
      }
      System.out.println(names);
      return GSON.toJson(names);
    }
  }

  /**
   * Loads an existing project, given an index in an object of the form:
   * {choice: i}.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private class LoadProjectHandler implements Route {
    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      int choice = GSON.fromJson(qm.value("choice"), Integer.class);
      project = new StoryboarderProject(pathChoices.get(choice));
      startAutoSave();
      return "success loading project!";
    }
  }

  /**
   * Creates a project in the projects directory, given an object of the form
   * {name: "someName"}. If the name does not end in ".txt", ".txt" will be
   * added to it.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private class CreateProjectHandler implements Route {
    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String fileName = qm.value("name");
      if (!fileName.endsWith(".txt")) {
        fileName += ".txt";
      }
      Path newFile = Paths.get(PROJECT_FOLDER.toString(), qm.value("name"));
      pathChoices.add(newFile);
      try {
        Files.createFile(newFile);
      } catch (IOException e) {
        System.err.println("ERROR: could not create the file: "
            + e.getMessage());
        return "failure creating project!";
      }
      project = new StoryboarderProject(newFile);
      startAutoSave();
      return "success creating project!";
    }

  }

  // private class InitHandler implements Route {
  //
  // @Override
  // public Object handle(Request req, Response res) {
  // QueryParamsMap qm = req.queryMap();
  //
  // // In case of reinitialization.
  // if (project != null) {
  // saveToDisk();
  // }
  //
  // try {
  // project = new StoryboarderProject(qm.value("path"));
  // } catch (IOException e) {
  // return "Failed to create/find the path.";
  // }
  //
  // if (qm.value("loadOrCreate").equals("create")) {
  // try {
  // Path projectPath = Paths.get(qm.value("name"));
  // project.create();
  // } catch (FileAlreadyExistsException e) {
  // return "Project of the same name already exists!";
  // } catch (IOException e) {
  // return "Failed to create the project.";
  // }
  // } else if (qm.value("loadOrCreate").equals("load")) {
  // try {
  // project.load();
  // } catch (NoSuchFileException e) {
  // return "Could not find the project.";
  // } catch (IOException e) {
  // return "Failed to load the project.";
  // }
  // }
  // startAutoSave();
  // return "Success initializing!";
  // }
  //
  // }

  /**
   * Loads a page with the given index from the project, given an object of the
   * form: {page: i}.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   *
   */
  private class LoadHandler implements Route {

    /**
     * @param req
     * @param res
     *          The response.
     * @return a JSON object with a list of Storyboarder pages, or a JSON object
     *         with a failure message it cannot find/access/read the file.
     */
    @Override
    public Object handle(Request req, Response res) {
      String msg = "\nGot load request\n";

      if (project != null) {
        QueryParamsMap qm = req.queryMap();
        msg += "page: " + qm.value("page") + "\nresult:\n";

        int page = GSON.fromJson(qm.value("page"), Integer.class);
        if (page < project.numberOfPages()) {
          System.out.println(msg + project.getPage(page));
          return project.getPage(page);
        } else {
          System.out.println(msg + "index out of bounds!");
          return "index out of bounds!";
        }
      } else {
        System.out.println(msg + NULL_PROJ_MSG);
        return NULL_PROJ_MSG;
      }
    }
  }

  /**
   * Saves the given json string as a page in the project, given an object of
   * the form: {page: i, json: "json string"}.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   *
   */
  private class SaveHandler implements Route {
    /**
     * Writes the JSON strings for each page on a new line of a file at the
     * given path (in req). If a file is present with the same path, it will be
     * overwritten.
     *
     * @param req
     *          The request containing a QueryParamsMap, which contains a path
     *          and a JSON array of JSON Storyboarder pages.
     * @param res
     *          The response.
     * @return a ModelAndView containing a message saying whether or not the
     *         save was successful.
     */
    @Override
    public Object handle(Request req, Response res) {
      String msg = "\nGot save request\n";

      if (project != null) {
        QueryParamsMap qm = req.queryMap();
        System.out.println(msg + "page: " + qm.value("page") + "\njson: "
            + qm.value("json"));

        int page = GSON.fromJson(qm.value("page"), Integer.class);
        String json = qm.value("json");
        project.saveOrAdd(page, json);
        return "success saving!";
      } else {
        System.out.println(msg + NULL_PROJ_MSG);
        return NULL_PROJ_MSG;
      }
    }
  }

  private class QuitHandler implements Route {

    @Override
    public Object handle(Request arg0, Response arg1) {
      System.out.println();
      System.out.println("got quit request");
      // Spark.stop();
      return saveToDisk();
    }

  }
}
