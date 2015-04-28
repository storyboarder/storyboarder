package storyboarder;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

public class StoryboarderProjectTest {
  private static final Path dbPath = Paths.get("test.sqlite3");

  private static StoryboarderProject testProj;

  @BeforeClass
  public static void createTestDatabase() throws ClassNotFoundException,
    SQLException, IOException {
    Files.deleteIfExists(dbPath);
    testProj = new StoryboarderProject(dbPath);
    assertEquals(0, testProj.numberOfPages());
  }

  @AfterClass
  public static void deleteDatabase() throws SQLException, IOException {
    Files.deleteIfExists(dbPath);
  }

  @Test
  public void everythingTest() {
    StoryboarderPage page1 = new StoryboarderPage(1, "foo bar", "derp");
    StoryboarderPage page2 = new StoryboarderPage(2, "page two!", "yurp");
    StoryboarderPage page4 = new StoryboarderPage(4, "page four!", "nurp");

    assertTrue(testProj.addPage("foo bar", "derp"));
    assertEquals(1, testProj.numberOfPages());

    assertTrue(testProj.addPage(page2));
    assertEquals(2, testProj.numberOfPages());

    // will not add page4 since there is no page 3
    boolean thrown = false;
    try {
      testProj.addPage(page4);
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    assertEquals(2, testProj.numberOfPages());

    assertEquals(page1, testProj.getPage(1));
    assertEquals(page2, testProj.getPage(2));

    try {
      testProj.getPage(0);
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    thrown = false;
    try {
      testProj.getPage(3);
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

  }

  private List<StoryboarderPage> getAllPages() throws SQLException {
    List<StoryboarderPage> pages = new ArrayList<StoryboarderPage>();
    for (int i = 1; i <= testProj.numberOfPages(); i++) {
      pages.add(testProj.getPage(i));
    }
    return pages;
  }

}
