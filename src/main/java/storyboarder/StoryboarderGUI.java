package storyboarder;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
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
final class StoryboarderGUI {

  private static final Gson GSON = new Gson();

  private static final Charset CHARSET = StandardCharsets.UTF_8;

  private final int port;

  private File project;

  StoryboarderGUI(int port) {
    this.port = port;
  }

  StoryboarderGUI loadProject(String path) {
    project = new File(path);
    assertions();
    return this;
  }

  StoryboarderGUI createProject(String path) throws IOException {
    project = new File(path);
    if (!project.mkdirs()) {
      throw new IOException("Could not create the necessary directories.");
    }
    if (!project.createNewFile()) {
      throw new IOException("Could not create the file.");
    }
    assertions();
    return this;
  }

  private void assertions() {
    assert project.isFile();
    assert project.exists();
    assert project.canRead();
    assert project.canWrite();
  }

  void start() {
    Spark.setPort(port);
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.get("/home", new Setup(), new FreeMarkerEngine());

    Spark.post("/load", new LoadHandler());
    Spark.post("/save", new SaveHandler());
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
      List<String> pages = new ArrayList<String>();

      try (BufferedReader reader = Files.newBufferedReader(project.toPath(),
          CHARSET)) {
        String line;
        while ((line = reader.readLine()) != null) {
          pages.add(line);
        }
      } catch (IOException e) {
        return GSON.toJson(new String[] {"Failure: " + e.getMessage()});
      }

      if (qm.value("page").equals("all")) {
        return GSON.toJson(pages);
      } else {
        int page = GSON.fromJson(qm.value("page"), Integer.class);
        return GSON.toJson(pages.get(page));
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
      String Json = qm.value("json");

      OpenOption options = StandardOpenOption.WRITE;
      try (BufferedWriter writer = Files.newBufferedWriter(project.toPath(),
          CHARSET, options)) {
        return null;
      } catch (IOException e) {
        return "Failure: " + e.getMessage();
      }

    }
  }

  private static class SavePageHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String page = qm.value("page");
      System.out.println(page);
      return GSON.toJson("saved");
    }
  }
}
