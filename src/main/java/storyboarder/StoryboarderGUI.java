package storyboarder;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

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

  private static final String FILE_TYPE = ".sqlite3";

  private static final String NULL_PROJ_MSG = "ERROR: Need to initialize the project!";

  private static final Path PROJECT_FOLDER = Paths.get("projects");

  private static final Gson GSON = new Gson();

  private final int port;

  private StoryboarderProject project;

  private Set<Path> pathChoices = getPathChoices();

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

    Spark.post("/getPage", new GetPageHandler());
    Spark.post("/savePage", new SavePageHandler());
    Spark.post("/addPage", new AddPageHandler());
  }

  private static Set<Path> getPathChoices() {
    try {
      Files.createDirectories(PROJECT_FOLDER);
    } catch (IOException e) {
      System.err.println("ERROR: error creating necessary directories: "
          + e.getMessage());
    }
    Set<Path> pathChoices = new TreeSet<Path>();

    try (DirectoryStream<Path> choicesStream = Files
        .newDirectoryStream(PROJECT_FOLDER)) {
      Iterator<Path> choicesIterator = choicesStream.iterator();

      while (choicesIterator.hasNext()) {
        Path nextPath = choicesIterator.next();
        if (nextPath.toString().endsWith(FILE_TYPE)) {
          pathChoices.add(nextPath);
        }
      }
      System.out.println(pathChoices);
    } catch (IOException e) {
      System.err.println("ERROR: error getting possible projects: "
          + e.getMessage());
    }
    return pathChoices;

  }

  private Object stringifyProject() {
    int numPages = project.numberOfPages();
    StoryboarderPage firstPage = StoryboarderPage.emptyPage();
    if (numPages >= 1) {
      firstPage = project.getPage(1);
    }
    Map<String, Object> data = ImmutableMap.of("page", firstPage, "numPages",
        numPages);
//    System.out.println("current project: " + project + ", data: " + data);

    return GSON.toJson(data);
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
        String choiceName = choice.getFileName().toString();
        names.add(choiceName.replace(FILE_TYPE, ""));
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
      List<Path> pathChoicesList = new ArrayList<Path>(pathChoices.size());
      pathChoicesList.addAll(pathChoices);

      try {
        project = new StoryboarderProject(pathChoicesList.get(choice));
      } catch (ClassNotFoundException | SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } catch (IndexOutOfBoundsException e) {
        return GSON.toJson("index out of bounds!");
      }
      return stringifyProject();
    }
  }

  /**
   * Creates a project in the projects directory, given an object of the form
   * {name: "someName"}. If the name does not end in FILE_TYPE, FILE_TYPE will
   * be added to it.
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
      if (!fileName.endsWith(FILE_TYPE)) {
        fileName += FILE_TYPE;
      }
      Path newFile = Paths.get(PROJECT_FOLDER.toString(), fileName);
      if (pathChoices.add(newFile)) {
        try {
          project = new StoryboarderProject(newFile);
        } catch (ClassNotFoundException | SQLException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        return stringifyProject();
      } else {
        return GSON.toJson("project already exists!");
      }
    }

  }

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
  private class GetPageHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      String msg = "\nGot get page request\n";

      if (project != null) {
        QueryParamsMap qm = req.queryMap();
        msg += "page: " + qm.value("page") + "\nresult:\n";

        int page = GSON.fromJson(qm.value("page"), Integer.class);
        System.out.println("current project: " + project);
        try {
          return GSON.toJson(project.getPage(page));
        } catch (IndexOutOfBoundsException e) {
          return GSON.toJson("index out of bounds!");
        }
      } else {
        System.out.println(msg + NULL_PROJ_MSG);
        return GSON.toJson(NULL_PROJ_MSG);
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
  private class SavePageHandler implements Route {
    /**
     * Writes the JSON strings for each page on a new line of a file at the
     * given path (in req). If a file is present with the same path, it will be
     * overwritten.
     *
     * @param req
     *          TODO
     * @param res
     *          TODO
     * @return TODO
     */
    @Override
    public Object handle(Request req, Response res) {
      String msg = "\nGot save request\n";

      if (project != null) {
        try {
          project.savePage(getPageFromReq(req));
        } catch (IndexOutOfBoundsException e) {
          return GSON.toJson("index out of bounds!");
        }
        return GSON.toJson("success saving!");
      } else {
        System.out.println(msg + NULL_PROJ_MSG);
        return GSON.toJson(NULL_PROJ_MSG);
      }
    }
  }

  private StoryboarderPage getPageFromReq(Request req) {
    QueryParamsMap qm = req.queryMap();
    int num = Integer.parseInt(qm.value("num"));
    String json = qm.value("json");
    String thumbnail = qm.value("thumbnail");
    return new StoryboarderPage(num, json, thumbnail);
  }

  private class AddPageHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("\n got add page request\n");
      if (project != null) {
        try {
          project.addPage(getPageFromReq(req));
        } catch (IndexOutOfBoundsException e) {
          return GSON.toJson("index out of bounds!");
        }
        return GSON.toJson("success adding!");
      } else {
        System.out.println(NULL_PROJ_MSG);
        return GSON.toJson(NULL_PROJ_MSG);
      }
    }
  }
}
