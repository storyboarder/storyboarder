package storyboarder;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class PageTest {
  @Test
  public void constructionTest() {

  }

  @Test
  public void voo() {
    Page page = new Page(3, "foo", "bar");
    assertEquals(3, page.getNum());
    assertEquals("foo", page.getJson());
    assertEquals("bar", page.getThumbnail());
  }
}
