package sqlUtil;

import java.sql.ResultSet;
import java.sql.SQLException;

public interface ResultConverter<T> {
  T convert(ResultSet rs) throws SQLException;
}
