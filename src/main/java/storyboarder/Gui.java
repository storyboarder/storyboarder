package storyboarder;

import java.util.Map;

import spark.ModelAndView;
import spark.QueryParamsMap;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import spark.TemplateViewRoute;
import spark.template.freemarker.FreeMarkerEngine;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

/**
 * Handles all of the GUI stuff.
 *
 * @author fbystric
 * @author vmperez
 *
 */
public final class Gui {

  private static final Gson GSON = new Gson();

  private Gui() {
  }

  /**
   * @param port
   */
  public static void runSparkServer(int port) {
    Spark.setPort(port);
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/load", new LoadHandler());
    Spark.post("/save", new SaveHandler());

  }

  /**
   * Sends set up data to the spark site.
   *
   * @author fbystric
   *
   */
  private static class Setup implements TemplateViewRoute {

    @Override
    public ModelAndView handle(Request arg0, Response arg1) {
      Map<String, Object> variables = ImmutableMap.of("title", "Maps");
      return new ModelAndView(variables, "main.ftl");
    }
  }

  private static class LoadHandler implements Route {
    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String[] results = {};
      return GSON.toJson(results);
    }

  }

  private static class SaveHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String[] results = {};
      return GSON.toJson(results);
    }

  }

}
