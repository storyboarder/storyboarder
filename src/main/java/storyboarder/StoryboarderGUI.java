package storyboarder;

import java.io.IOException;
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

  private static final Gson GSON = new Gson();

  private final int port;

  private final StoryboarderProject project;

  StoryboarderGUI(int port, StoryboarderProject project) {
    this.port = port;
    this.project = project;
  }

  void start() {
    Spark.setPort(port);
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/load", new LoadHandler());
    Spark.post("/save", new SaveHandler());
    Spark.post("/quit", new QuitHandler());

    TimerTask saveTask = new TimerTask() {
      @Override
      public void run() {
        System.out.println("Saving to disk...");
        try {
          project.saveToDisk();
        } catch (IOException e) {
          System.err.println("ERROR: saving: " + e.getMessage());
        }
      }
    };

    Timer saveTimer = new Timer();
    saveTimer.schedule(saveTask, AUTO_SAVE_TIME);

  }

  String quit() {
    System.out.println("Hi");
    try {
      project.saveToDisk();
      Spark.stop();
      return "success!";
    } catch (IOException e) {
      return "failure!";
    }
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
   * Loads a Storyboarder project from a given path.
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
     *          The request containing a path to the file to load from.
     * @param res
     *          The response.
     * @return a JSON object with a list of Storyboarder pages, or a JSON object
     *         with a failure message it cannot find/access/read the file.
     */
    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      int page = GSON.fromJson(qm.value("page"), Integer.class);
      if (page < project.numberOfPages()) {
        return project.getPage(page);
      } else {
        return "index out of bounds!";
      }
    }
  }

  /**
   * Saves a Storyboarder project to a given path. If a file is present with the
   * same path, it will be overwritten.
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
      QueryParamsMap qm = req.queryMap();
      int page = GSON.fromJson(qm.value("page"), Integer.class);
      String json = qm.value("json");
      project.saveOrAdd(page, json);
      return "success!";
    }
  }

  private class QuitHandler implements Route {

    @Override
    public Object handle(Request arg0, Response arg1) {
      try {
        project.saveToDisk();
        Spark.stop();
        return "success!";
      } catch (IOException e) {
        return "failure!";
      }
    }

  }
}
