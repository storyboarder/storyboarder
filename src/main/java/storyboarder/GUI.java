package storyboarder;

import java.nio.file.Path;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
final class GUI {
  private static final Gson GSON = new Gson();

  private static final String PARAM = ":action";

  private static final String NULL_PROJ_JSON =
      GSON.toJson("ERROR: Need to initialize the project!");

  private static final String OUT_OF_BOUNDS_JSON =
      GSON.toJson("ERROR: Index out of bounds!");

  private static final String INVALID_PARAM_JSON =
      GSON.toJson("ERROR: Invalid parameter in post request string!");

  private final int port;

  private Project project;

  GUI(int port, Project project) {
    this.port = port;
    this.project = project;
  }

  GUI(int port) {
    this.port = port;
  }

  void start() {
    Spark.setPort(port);
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/projects/" + PARAM, new ProjectActions());
    Spark.post("/pages/" + PARAM, new PageActions());
  }

  /**
   * Serializes the current project.
   *
   * @return The number of pages in a project, and the first page of the
   *         project. The first page element will be null if the number of pages
   *         is zero.
   */
  private Object stringifyProject() {
    int numPages = project.getPageCount();
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("numPages", numPages);
    data.put("page", "empty project");
    if (numPages > 0) {
      data.put("page", project.getPage(1));
    }
    System.out.println("current project: " + project + ", data: " + data);
    return GSON.toJson(data);
  }

  private class ProjectActions implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("\nProject action: " + req.params(PARAM)
          + ", current proj: " + project);

      QueryParamsMap qm = req.queryMap();
      switch (req.params(PARAM)) {
        case "create":
          return create(qm);
        case "load":
          return load(qm);
        case "choices":
          return GSON.toJson(Projects.getProjects().keySet());
        default:
          return INVALID_PARAM_JSON;

      }
    }

    private Object create(QueryParamsMap qm) {

      String givenName = qm.value("name").replace(Projects.fileType(), "");
      Map<String, Path> projects = Projects.getProjects();

      String fileName = givenName;

      int i = 2;
      while (projects.containsKey(fileName)) {
        fileName = givenName + i;
        i++;
      }
      fileName += Projects.fileType();

      Path newFile = Projects.projectFolder().resolve(fileName);

      // if (Projects.addPathChoice(newFile)) {
      try {
        project = new Project(newFile);
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        return GSON.toJson("ERROR creating project.");
      }
      return stringifyProject();
      // } else {
      // return GSON.toJson("Project already exists!");
      // }
    }

    private Object load(QueryParamsMap qm) {
      // if (qm.value("choice") == null) {
      // return GSON.toJson("Need choice field.");
      // }
      // int choice = GSON.fromJson(qm.value("choice"), Integer.class);
      //
      // try {
      // Path newFile = Projects.getPathChoice(choice);
      // project = new Project(newFile);
      // } catch (ClassNotFoundException | SQLException e) {
      // e.printStackTrace();
      // return GSON.toJson("ERROR loading project.");
      // } catch (IndexOutOfBoundsException e) {
      // return OUT_OF_BOUNDS_JSON;
      // }
      String name = qm.value("name");
      if (name == null) {
        return GSON.toJson("Need a name field");
      }
      try {
        Path newFile = Projects.getProjects().get(name);
        project = new Project(newFile);
        return stringifyProject();
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        return GSON.toJson("ERROR loading project.");
      }
    }

  }

  private class PageActions implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("\nPage action: " + req.params(PARAM)
          + ", current proj: " + project);

      if (project == null) {
        return NULL_PROJ_JSON;
      }

      if (req.params(PARAM).equals("getAll")) {
        return getAll();
      }

      QueryParamsMap qm = req.queryMap();

      if (qm.value("pageNum") == null) {
        return GSON.toJson("Need a pageNum field");
      }

      int pageNum = GSON.fromJson(qm.value("pageNum"), Integer.class);

      switch (req.params(PARAM)) {
        case "get":
          return get(pageNum);
        case "save":
          return save(qm, pageNum);
        case "move":
          return move(qm, pageNum);
        case "add":
          System.out.println("qm value json is: " + qm.value("json"));
          return add(qm, pageNum);
        default:
          return INVALID_PARAM_JSON;
      }
    }

    private Object getAll() {
      List<Page> pages = project.getAllPages();
      if (pages.isEmpty()) {
        return GSON.toJson("Failure getting pages, or project is empty.");
      }
      return GSON.toJson(pages);
    }

    private Object get(int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      return GSON.toJson(project.getPage(pageNum));
    }

    private String save(QueryParamsMap qm, int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      if (project.savePage(getPage(qm, pageNum))) {
        return GSON.toJson("Successfully saved page " + pageNum);
      } else {
        return GSON.toJson("Failure saving page " + pageNum);
      }
    }

    private String move(QueryParamsMap qm, int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      if (qm.value("newSpot") == null) {
        return GSON.toJson("Need a newSpot field");
      }
      int newSpot = GSON.fromJson(qm.value("newSpot"), Integer.class);

      if (!project.inBounds(newSpot)) {
        return OUT_OF_BOUNDS_JSON;
      }

      if (project.movePage(pageNum, newSpot)) {
        return GSON.toJson("Successfully moved page " + pageNum + " to "
            + newSpot);
      } else {
        return GSON.toJson("Failure moving page " + pageNum + " to " + newSpot);
      }
    }

    private String add(QueryParamsMap qm, int pageNum) {
      if (pageNum != project.getPageCount() + 1) {
        return OUT_OF_BOUNDS_JSON;
      }
      if (project.addPage(getPage(qm, pageNum))) {
        return GSON.toJson("Successfully added page");
      } else {
        return GSON.toJson("Failure adding page");
      }
    }

    private Page getPage(QueryParamsMap qm, int pageNum) {
      String json = qm.value("json");
      String thumbnail = qm.value("thumbnail");
      return new Page(pageNum, json, thumbnail);
    }

  }

  /**
   * Sends set-up data to the spark site. No parameters needed.
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

}
