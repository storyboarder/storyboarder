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
 * Hosts a GUI spark server.
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

  private static Project project;

  private GUI() {
    String message = "This class cannot have instances.";
    throw new UnsupportedOperationException(message);
  }

  /**
   * Starts the server at a given port.
   *
   * @param port
   *          The port at which to host the server.
   */
  static void start(int port) {
    Spark.setPort(port);
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
  private static Object stringifyProject() {
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

  /**
   * Checks that a QueryParamsMap contains the required arguments.
   *
   * @param qm
   *          The map of given arguments.
   * @param requiredParams
   *          The parameters for which 'qm' must have a non-null value.
   * @return An Optional containing the appropriate error message if 'qm' is
   *         missing a parameter, or an empty Optional if 'qm' has all the
   *         required parameters.
   */
  private static Optional<String> checkParams(QueryParamsMap qm,
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
  private static class ProjectActions implements Route {

    /**
     * Reads a request and calls the appropriate method, or returns appropriate
     * error messages where applicable.
     *
     * @param req
     * @param res
     * @return a JSON string containing the response to the request, or an
     *         appropriate error message if the request is invalid or an error
     *         occurs trying to fulfill the request.
     */
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
          project = null;
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

    /**
     * Creates and loads a project with the given name, or a modified name if a
     * project of the same name already exists.
     *
     * @param name
     *          The name of the new project.
     * @param projects
     *          The existing projects, a map of names to Paths.
     * @return the result of {@link GUI#stringifyProject()} using the new
     *         project, or a JSON error message if there is an error creating
     *         the project.
     */
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

      try {
        project = new Project(newFile);
      } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
        return JsonMessages.makeError("Could not create project: "
            + e.getMessage());
      }
      return stringifyProject();

    }

    /**
     * Loads the project of the given name, if it can be found.
     *
     * @param name
     *          The name of the project to be loaded.
     * @param projects
     *          The existing projects, a map of names to Paths.
     * @return the result of {@link GUI#stringifyProject()} using the new
     *         project, or a JSON error message if there is an error loading the
     *         project or if the project doesn't exist.
     */
    private Object load(String name, Map<String, Path> projects) {
      if (!projects.containsKey(name)) {
        return JsonMessages.makeError(name + " does not exist.");
      }
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

    /**
     * Deletes the project of the given name.
     *
     * @param name
     *          The name of the project to be deleted.
     * @param projects
     *          The existing projects, a map of names to Paths.
     * @return a JSON message if the project was successfully deleted, or a JSON
     *         error message if the project doesn't exist, or there was a error
     *         deleting the project.
     */
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
  private static class PageActions implements Route {

    /**
     * Reads a request and calls the appropriate method, or returns appropriate
     * error messages where applicable.
     *
     * @param req
     * @param res
     * @return a JSON string containing the response to the request, or an
     *         appropriate error message if the request is invalid or an error
     *         occurs trying to fulfill the request.
     */
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
              Optional<String> check = checkParams(qm, "newSpot");
              if (check.isPresent()) {
                System.err.println(check.get());
                return JsonMessages.makeError(check.get());
              }
              int newSpot = GSON.fromJson(qm.value("newSpot"), Integer.class);
              return move(pageNum, newSpot);
            case "delete":
              return delete(pageNum);
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

    /**
     * Gets all of the pages in the current project.
     *
     * @return A list of all the pages in the current project, or a JSON error
     *         message if the project is empty or there was an error querying
     *         the database for pages.
     */
    private Object getAll() {
      List<Page> pages = project.getAllPages();
      if (pages.isEmpty()) {
        return JsonMessages
            .makeError("Failure getting pages, or project is empty.");
      }
      return GSON.toJson(pages);
    }

    /**
     * Gets a single page in the current project.
     *
     * @param pageNum
     *          The number of the page to get, 1-indexed.
     * @return The page with the given number, or a JSON error message if
     *         pageNum is out of bounds.
     */
    private Object get(int pageNum) {
      if (!project.inBounds(pageNum)) {
        return OUT_OF_BOUNDS_JSON;
      }
      return GSON.toJson(project.getPage(pageNum));
    }

    private Object delete(int pageNum) {
      if (project.removePage(pageNum)) {
        return JsonMessages.makeMessage("Sueccess deleting page " + pageNum);
      } else {
        return JsonMessages.makeError("Failure deleting page " + pageNum);
      }
    }

    /**
     * Saves a page to the current project.
     *
     * @param page
     * @return a JSON message if the page was successfully saved, or a JSON
     *         error message if the page's number is out of bounds, or an error
     *         occurs while saving the project.
     */
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

    /**
     * Moves a page from its position to a new position.
     *
     * @param pageNum
     *          The number of the page to move, 1-indexed.
     * @param newSpot
     *          The position to which the page will be moved, 1-indexed.
     * @return a JSON message if the page was successfully moved, or a JSON
     *         error message if either pageNum or newSpot are out of bounds, or
     *         there is an error moving the page.
     */
    private Object move(int pageNum, int newSpot) {
      if (!(project.inBounds(pageNum) && !project.inBounds(newSpot))) {
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

    /**
     * Adds a page to the current project.
     *
     * @param page
     *          The page to be added.
     * @return a JSON message if the page was successfully moved, or a JSON
     *         error message if the page's number is not equal to the number of
     *         pages plus 1, or there is an error adding the page.
     */
    private Object add(Page page) {
      if (page.getNum() != project.getPageCount() + 1) {
        return OUT_OF_BOUNDS_JSON;
      }
      if (project.addPage(page)) {
        return JsonMessages.makeMessage("Successfully added page");
      } else {
        return JsonMessages.makeError("Failure adding page");
      }
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

    /**
     * @return a ModelAndView object containing the location of the main ftl
     *         file, and the title.
     */
    @Override
    public ModelAndView handle(Request arg0, Response arg1) {
      Map<String, Object> variables = ImmutableMap.of("title", "Storyboarder");
      return new ModelAndView(variables, "main.ftl");
    }
  }

}
