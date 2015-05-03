/**
 * Contains classes to run a Storyboarder project:
 * <ul>
 * <li> {@link sqlutil.ResultConverter}, an interface for converting one row of
 * an SQL ResultSet to the object stored in that row.</li>
 * <li>  {@link sqlutil.ResultConverters} is a static class that stores basic
 * ResultConverters.</li>
 * <li>  {@link sqlutil.SqlQueryer} handles queries to an SQL database.</li>
 * <li>  {@link sqlutil.SqlString} represents an SQL query and helps safely
 * construct parametric queries with many parameters.</li>
 * </ul>
 *
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
package sqlutil;

