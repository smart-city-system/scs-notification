import type { Pagination } from "nestjs-typeorm-paginate"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function toSnakeCaseMeta(meta: Pagination<any>["meta"]) {
  return {
    total_items: meta.totalItems,
    item_count: meta.itemCount,
    items_per_page: meta.itemsPerPage,
    total_pages: meta.totalPages,
    current_page: meta.currentPage,
  }
}

export const generateNameId = ({ name, id }: { name: string; id: string }) => {
  return `${removeSpecialCharacter(name).replace(/\s/g, "-")}-i-${id}`
}
export const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "")
