package storyboarder;

import java.nio.file.Path;
import java.sql.SQLException;
import java.util.HashMap;
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

  private static final String PARAM = ":action";

  private static final String NULL_PROJ_MSG = "ERROR: Need to initialize the project!";

  private static final String OUT_OF_BOUNDS_MSG = "ERROR: Index out of bounds!";
  private static final String INVALID_PARAM_MSG = "ERROR: Invalid parameter in post request string!";

  private static final Gson GSON = new Gson();

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
      System.out.println("Project action requested, current proj: " + project);
      QueryParamsMap qm = req.queryMap();

      switch (req.params(PARAM)) {
        case "create":
          return create(qm);
        case "load":
          return load(qm);
        case "choices":
          return GSON.toJson(Projects.pathChoiceNames());
        default:
          return INVALID_PARAM_MSG;

      }
    }

    private Object create(QueryParamsMap qm) {
      String fileName = qm.value("name");
      if (!fileName.endsWith(Projects.fileType())) {
        fileName += Projects.fileType();
      }
      Path newFile = Projects.projectFolder().resolve(fileName);

      if (Projects.addPathChoice(newFile)) {
        try {
          project = new Project(newFile);
        } catch (ClassNotFoundException | SQLException e) {
          e.printStackTrace();
          return "ERROR creating project.";
        }
        return stringifyProject();
      } else {
        return "Project already exists!";
      }
    }

    private Object load(QueryParamsMap qm) {
      if (qm.value("choice") == null) {
        return "Need choice field.";
      }
      int choice = GSON.fromJson(qm.value("choice"), Integer.class);

      try {
        Path newFile = Projects.getPathChoice(choice);
        project = new Project(newFile);
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        return "ERROR loading project.";
      } catch (IndexOutOfBoundsException e) {
        return OUT_OF_BOUNDS_MSG;
      }
      return stringifyProject();
    }

  }

  private class PageActions implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("Page action requested, current proj: " + project);

      if (project == null) {
        return NULL_PROJ_MSG;
      }

      QueryParamsMap qm = req.queryMap();

      if (qm.value("pageNum") == null) {
        return "Need a pageNum field";
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
          return add(qm, pageNum);
        default:
          return INVALID_PARAM_MSG;
      }
    }

    private Object get(int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_MSG;
      }
      return GSON.toJson(project.getPage(pageNum));
    }

    private String save(QueryParamsMap qm, int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_MSG;
      }
      if (project.savePage(getPage(qm, pageNum))) {
        return "Successfully saved page " + pageNum;
      } else {
        return "Failure saving page " + pageNum;
      }
    }

    private String move(QueryParamsMap qm, int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_MSG;
      }
      if (qm.value("newSpot") == null) {
        return "Need a newSpot field";
      }
      int newSpot = GSON.fromJson(qm.value("newSpot"), Integer.class);
      if (project.movePage(pageNum, newSpot)) {
        return "Successfully moved page " + pageNum + " to " + newSpot;
      } else {
        return "Failure moving page " + pageNum + " to " + newSpot;
      }
    }

    private String add(QueryParamsMap qm, int pageNum) {
      if (pageNum != project.getPageCount() + 1) {
        return OUT_OF_BOUNDS_MSG;
      }
      if (project.addPage(getPage(qm, pageNum))) {
        return "Successfully added page";
      } else {
        return "Failure adding page";
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
