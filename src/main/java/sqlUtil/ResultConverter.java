package sqlUtil;

import java.sql.ResultSet;
import java.sql.SQLException;

public interface ResultConverter<T> {
  T convert(ResultSet rs) throws SQLException;

  public static <E> ResultConverter<E> singleColumnConverter(Class<E> type) {
    return new ResultConverter<E>() {
      @Override
      public E convert(ResultSet rs) throws SQLException {
        return rs.getObject(1, type);
      }
    };
  }
}
