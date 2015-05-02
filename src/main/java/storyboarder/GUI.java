package storyboarder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

  /**
   * The name given to parameters passed to Spark routes in requests.
   */
  private static final String PARAM = ":action";

  /**
   * The JSON error message returned whenever a request is made that does not
   * contain one of the possible arguments.
   */
  private static final Object INVALID_PARAM_JSON =
      JsonMessages.makeError("Invalid parameter in post request string!");

  /**
   * The JSON error message returned when a project request is made before a
   * project is created or loaded.
   */
  private static final Object NULL_PROJ_JSON =
      JsonMessages.makeError("Need to initialize the project!");

  /**
   * The JSON error message returned whenever a request is made that would or
   * did result in an IndexOutOfBounds error.
   */
  private static final Object OUT_OF_BOUNDS_JSON =
      JsonMessages.makeError("Index out of bounds!");

  private Project project;

  GUI(int port, Project project) {
    Spark.setPort(port);
    this.project = project;
  }

  GUI(int port) {
    Spark.setPort(port);
  }

  void start() {
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/projects/" + PARAM, new ProjectActions());
    Spark.post("/pages/" + PARAM, new PageActions());
  }

  /**
   * Serializes the current project.
   *
   * @return The number of pages in a project, the name of the project, and the
   *         first page of the project. The first page element will be 'empty
   *         project' if the number of pages is zero.
   */
  private Object stringifyProject() {
    int numPages = project.getPageCount();
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("numPages", numPages);
    data.put("name", project.name());
    data.put("page", "empty project");
    if (numPages > 0) {
      data.put("page", project.getPage(1));
    }
    System.out.println("current project: " + project + ", data: " + data);
    return GSON.toJson(data);
  }

  private Optional<String> checkParams(QueryParamsMap qm,
      String... requiredParams) {
    for (String param : requiredParams) {
      if (qm.value(param) == null) {
        return Optional.of("Need a field: '" + param + "'");
      }
    }
    return Optional.empty();
  }

  /**
   * Handles all actions that involve the entire Project.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private class ProjectActions implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("\nProject action: " + req.params(PARAM)
          + ", current proj: " + project);
      Map<String, Path> projects = Projects.getProjects();

      if (req.params(PARAM).equals("choices")) {
        return GSON.toJson(projects.keySet());
      }

      if (!(project == null)) {
        try {
          project.close();
        } catch (Exception e) {
          e.printStackTrace();
          return JsonMessages.makeError("unable to close project.");
        }
      }

      QueryParamsMap qm = req.queryMap();

      Optional<String> check = checkParams(qm, "name");
      if (check.isPresent()) {
        System.err.println(check.get());
        return JsonMessages.makeError(check.get());
      }

      String name = qm.value("name");

      switch (req.params(PARAM)) {
        case "create":
          return create(name, projects);
        case "load":
          return load(name, projects);
        case "delete":
          return delete(name, projects);
        default:
          return INVALID_PARAM_JSON;

      }
    }

    private Object create(String name, Map<String, Path> projects) {

      // remove the file type from the end if present
      String givenName = name.replace(Projects.fileType(), "");
      String fileName = givenName;

      // add number to end until a unique name is made
      int i = 2;
      while (projects.containsKey(fileName)) {
        fileName = givenName + i;
        i++;
      }

      // re-add file type
      fileName += Projects.fileType();

      // create path to new file
      Path newFile = Projects.projectFolder().resolve(fileName);

      // if (Projects.addPathChoice(newFile)) {
      try {
        project = new Project(newFile);
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        // return GSON.toJson("ERROR creating project.");
        return JsonMessages.makeError("Could not create project: "
            + e.getMessage());
      }
      return stringifyProject();
      // } else {
      // return GSON.toJson("Project already exists!");
      // }
    }

    private Object load(String name, Map<String, Path> projects) {
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

      try {
        Path newFile = projects.get(name);
        project = new Project(newFile);
        return stringifyProject();
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        return JsonMessages.makeError("Could not load project: "
            + e.getMessage());
      }
    }

    private Object delete(String name, Map<String, Path> projects) {
      if (!projects.containsKey(name)) {
        return JsonMessages.makeError(name + " does not exist.");
      }
      try {
        Files.delete(projects.get(name));
        return JsonMessages.makeMessage("Success deleting " + name);
      } catch (IOException e) {
        e.printStackTrace();
        return JsonMessages.makeError("Failure deleting " + name);
      }
    }
  }

  /**
   * Handles all actions that involve individual Pages of a Project.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private class PageActions implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("\nPage action: " + req.params(PARAM)
          + ", current proj: " + project);

      if (project == null) {
        return NULL_PROJ_JSON;
      }

      // Check for params that don't need a QueryParamsMap
      switch (req.params(PARAM)) {
        case "getAll":
          return getAll();
        default:
          QueryParamsMap qm = req.queryMap();
          // All other params need a pageNum
          Optional<String> numCheck = checkParams(qm, "pageNum");
          if (numCheck.isPresent()) {
            System.err.println(numCheck.get());
            return JsonMessages.makeError(numCheck.get());
          }
          int pageNum = GSON.fromJson(qm.value("pageNum"), Integer.class);

          switch (req.params(PARAM)) {
            case "get":
              return get(pageNum);
            case "move":
              return move(qm, pageNum);
            default:
              // All other params need the whole page
              Optional<String> dataCheck = checkParams(qm, "json", "thumbnail");
              if (dataCheck.isPresent()) {
                System.err.println(dataCheck.get());
                return JsonMessages.makeError(dataCheck.get());
              }

              Page page = new Page(pageNum, qm.value("json"),
                  qm.value("thumbnail"));

              switch (req.params(PARAM)) {
                case "save":
                  return save(page);
                case "add":
                  return add(page);
                default:
                  return INVALID_PARAM_JSON;
              }
          }
      }
    }

    private Object getAll() {
      List<Page> pages = project.getAllPages();
      if (pages.isEmpty()) {
        return JsonMessages
            .makeError("Failure getting pages, or project is empty.");
      }
      return GSON.toJson(pages);
    }

    private Object get(int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      return GSON.toJson(project.getPage(pageNum));
    }

    private Object save(Page page) {
      if (!project.inBounds(page.getNum())) {
        return OUT_OF_BOUNDS_JSON;
      }
      if (project.savePage(page)) {
        return JsonMessages.makeMessage("Successfully saved page "
            + page.getNum());
      } else {
        return JsonMessages.makeError("Failure saving page " + page.getNum());
      }
    }

    private Object move(QueryParamsMap qm, int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      Optional<String> check = checkParams(qm, "newSpot");
      if (check.isPresent()) {
        System.err.println(check.get());
        return JsonMessages.makeError(check.get());
      }

      int newSpot = GSON.fromJson(qm.value("newSpot"), Integer.class);

      if (!project.inBounds(newSpot)) {
        return OUT_OF_BOUNDS_JSON;
      }

      if (project.movePage(pageNum, newSpot)) {
        return JsonMessages.makeMessage("Successfully moved page " + pageNum
            + " to " + newSpot);
      } else {
        return JsonMessages.makeError("Failure moving page " + pageNum + " to "
            + newSpot);
      }
    }

    private Object add(Page page) {
      if (page.getNum() != project.getPageCount() + 1) {
        return OUT_OF_BOUNDS_JSON;
      }
      // String json = qm.value("json");
      // String thumbnail = qm.value("thumbnail");
      // Page newPage = new Page(pageNum, json, thumbnail);
      if (project.addPage(page)) {
        return JsonMessages.makeMessage("Successfully added page");
      } else {
        return JsonMessages.makeError("Failure adding page");
      }
    }

    // private Page getPage(QueryParamsMap qm, int pageNum) {
    // String json = qm.value("json");
    // String thumbnail = qm.value("thumbnail");
    // return new Page(pageNum, json, thumbnail);
    // }

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
