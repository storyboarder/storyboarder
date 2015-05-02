package sqlutil;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Interface for converting one row of a SQL ResultSet to the object stored in
 * that row.
 *
 * @param <T>
 *          The type of object stored in the ResultSet.
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public interface ResultConverter<T> {
  /**
   * Converts one row of a ResultSet to an object of type T.
   *
   * @param rs
   *          The ResultSet that has a cursor pointing to the row of the object
   *          to be returned.
   * @return The object of type T stored in the ResultSet at the row pointed to
   *         by the current cursor.
   * @throws SQLException
   *           If an SQL error occurs while accessing the ResultSet.
   */
  T convert(ResultSet rs) throws SQLException;

}
