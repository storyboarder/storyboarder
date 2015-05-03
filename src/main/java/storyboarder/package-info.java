/**
 * Contains classes to run a Storyboarder project:
 * <ul>
 * <li> {@link storyboarder.GUI} hosts a spark server.</li>
 * <li> {@link storyboarder.JsonMessages} is a utility class for creating JSON
 * objects that represent messages or errors.</li>
 * <li> {@link storyboarder.Multiplayer} is a simple WebSocketServer
 * implementation. Keeps track of a "chatroom". Allows multiple users to work on
 * one project.</li>
 * <li> {@link storyboarder.Page} represents a page in a storyboarder project.
 * Stores page number, the page's json string, and the page's thumbnail.</li>
 * <li> {@link storyboarder.Project} represents a Storyboarder project. Stores
 * pages of a project in a database using their JSON strings.</li>
 * <li> {@link storyboarder.Projects} is a utility class containing methods for
 * creating SQL strings and getting existing projects</li>
 * </ul>
 *
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
package storyboarder;

