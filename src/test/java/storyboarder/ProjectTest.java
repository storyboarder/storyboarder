package storyboarder;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.List;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

public class ProjectTest {
  private static final Path dbPath = Paths.get("test.sqlite3");

  private static final List<Page> pages = ImmutableList.of(new Page(1,
      "foo bar", "derp"), new Page(2, "page two!", "yurp"), new Page(3,
      "page three!", "shmurp"), new Page(4, "page four!", "nurp"));

  private static Project testProj;

  @BeforeClass
  public static void createTestDatabase() throws ClassNotFoundException,
  SQLException, IOException {
    Files.deleteIfExists(dbPath);
    testProj = new Project(dbPath);
  }

  @AfterClass
  public static void deleteDatabase() throws Exception {
    Files.deleteIfExists(dbPath);
    testProj.close();
  }

  public static boolean addPages() {
    boolean result = true;
    for (Page page : pages) {
      result &= testProj.addPage(page);
    }
    return result;
  }

  @Test
  public void addTest() throws ClassNotFoundException, SQLException,
    IOException {
    createTestDatabase();
    boolean thrown = false;
    try {
      testProj.addPage(new Page(0, "", ""));
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    thrown = false;
    try {
      testProj.addPage(new Page(-1, "", ""));
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    // now add some pages
    assertTrue(addPages());

    thrown = false;
    try {
      testProj.addPage(new Page(0, "", ""));
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    thrown = false;
    try {
      testProj.addPage(new Page(-1, "", ""));
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    thrown = false;
    try {
      testProj.addPage(new Page(pages.size() + 2, "", ""));
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

  }

  @Test
  public void getPageTest() throws ClassNotFoundException, SQLException,
  IOException {
    createTestDatabase();

    assertTrue(addPages());
    for (Page page : pages) {
      assertEquals(page, testProj.getPage(page.getNum()));
    }

    testProj.ge

  }

  @Test
  public void everythingTest() throws ClassNotFoundException, SQLException,
    IOException {
    createTestDatabase();
    assertEquals(0, testProj.getPageCount());

    Page page1 = pages.get(0);
    Page page2 = pages.get(1);
    Page page4 = pages.get(3);

    assertTrue(testProj.addPage(page1.getJson(), page1.getThumbnail()));
    assertEquals(1, testProj.getPageCount());

    assertTrue(testProj.addPage(page2));
    assertEquals(2, testProj.getPageCount());

    // will not add page4 since there is no page 3
    boolean thrown = false;
    try {
      testProj.addPage(page4);
    } catch (IndexOutOfBoundsException e) {
      thrown = true;
    }
    assertTrue(thrown);

    assertEquals(2, testProj.getPageCount());

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

    for (int i = 0; i < 10; i++) {
      assertTrue(testProj.addPage("foo", "derp"));
    }

    assertEquals(12, testProj.getPageCount());

    Page page10 = new Page(10, "garf!", "bar");

    assertTrue(testProj.savePage(page10));

    assertTrue(testProj.movePage(10, 2));

    Page newPage2 = testProj.getPage(2);
    Page newPage3 = testProj.getPage(3);

    assertEquals(page10.getJson(), newPage2.getJson());
    assertEquals(page10.getThumbnail(), newPage2.getThumbnail());

    assertEquals(page2.getJson(), newPage3.getJson());
    assertEquals(page2.getThumbnail(), newPage3.getThumbnail());

    for (int i = 4; i <= testProj.getPageCount(); i++) {
      Page correctPage = new Page(i, "foo", "derp");
      Page curPage = testProj.getPage(i);
      assertEquals(correctPage, curPage);
    }

    assertTrue(testProj.movePage(2, 10));

    assertEquals(page2, testProj.getPage(2));
    assertEquals(page10, testProj.getPage(10));

  }

}
