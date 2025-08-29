import type { NamingStrategyInterface } from 'typeorm';
import { Table } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export class AdvancedSnakeNamingStrategy
  extends SnakeNamingStrategy
  implements NamingStrategyInterface
{
  override primaryKeyName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}_${clonedColumnNames.join('_')}`;
    return 'PK_' + key;
  }

  override foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    _referencedTablePath?: string,
    _referencedColumnNames?: string[],
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}_${clonedColumnNames.join('_')}`;
    return 'FK_' + key;
  }

  override indexName(
    tableOrName: Table | string,
    columnNames: string[],
    _where?: string,
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}_${clonedColumnNames.join('_')}`;
    // if (where) key += `_${where}`;

    return 'IDX_' + key;
  }

  override uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName =
      tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const replacedTableName = tableName.replace('.', '_');
    const key = `${replacedTableName}_${clonedColumnNames.join('_')}`;
    return 'UQ_' + key;
  }
}
