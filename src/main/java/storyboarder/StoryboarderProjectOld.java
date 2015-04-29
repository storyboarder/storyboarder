package storyboarder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

class StoryboarderProjectOld {

  private static final Charset CHARSET = StandardCharsets.UTF_8;

  private final Path project;

  private List<String> pages = new ArrayList<String>();

  StoryboarderProjectOld(Path project) {
    this.project = project;
  }

  StoryboarderProjectOld(String path) throws IOException {
    project = Paths.get(path);
  }

  void load() throws IOException {
    readFile();
  }

  void create() throws IOException {
    Files.createDirectories(project.getParent());
    Files.createFile(project);
  }

  String getPage(int page) {
    return pages.get(page);
  }

  int numberOfPages() {
    return pages.size();
  }

  String savePage(int page, String newContent) {
    return pages.set(page, newContent);
  }

  boolean addPage(String newPage) {
    return pages.add(newPage);
  }

  void saveOrAdd(int page, String newContent) {
    if (page >= numberOfPages()) {
      addPage(newContent);
    } else {
      savePage(page, newContent);
    }
  }

  void saveToDisk() throws IOException {
    System.out.println(this);
    OpenOption options = StandardOpenOption.WRITE;
    PrintWriter writer = new PrintWriter(Files.newBufferedWriter(project,
        CHARSET, options));

    for (String page : pages) {
      writer.println(page);
    }
    writer.close();
  }

  private void readFile() throws IOException {
    BufferedReader reader = Files.newBufferedReader(project, CHARSET);
    pages.clear();
    String line;
    while ((line = reader.readLine()) != null) {
      pages.add(line);
    }
    reader.close();
  }

  @Override
  public String toString() {
    return project.toString() + ": " + pages.toString();
  }

}