package storyboarder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
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
public final class Gui {

  private static final Gson GSON = new Gson();
  private static final Charset CHARSET = StandardCharsets.UTF_8;

  private Gui() {
  }

  /**
   * @param port
   */
  public static void runSparkServer(int port) {
    Spark.setPort(port);
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/load", new LoadHandler());
    Spark.get("/save", new SaveHandler(), new FreeMarkerEngine());

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
      Map<String, Object> variables = ImmutableMap.of("title", "Maps");
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
  private static class LoadHandler implements Route {
    private static final BufferedReader READER = new BufferedReader(
        new InputStreamReader(System.in, StandardCharsets.UTF_8));

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
      String path = qm.value("path");
      try {
        List<String> pages = Files.readAllLines(Paths.get(path), CHARSET);
        return GSON.toJson(pages);
      } catch (IOException e) {
        return GSON.toJson(new String[] {"Failure: " + e.getMessage()});
      }
    }
  }

  /**
   * Saves a Storyboarder project to a given path. If a file is present with the
   * same path, it will be overwritten. (TODO test that claim)
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   *
   */
  private static class SaveHandler implements TemplateViewRoute {
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
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> result;
      try {
        QueryParamsMap qm = req.queryMap();
        Path path = Paths.get(qm.value("path"));
        String Json = qm.value("pages");

        List<String> pages = Arrays.asList(GSON.fromJson(Json, String[].class));
        Files.write(path, pages, CHARSET);

        result = ImmutableMap.of("result", "Success!");
      } catch (IOException e) {
        result = ImmutableMap.of("result", "Failure: " + e.getMessage());
      }
      return new ModelAndView(result, "main.ftl");
    }

  }

}
