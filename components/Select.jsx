import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectScrollable() {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Sélection" />
      </SelectTrigger>
      <SelectContent>
        {/* <SelectGroup>
          <SelectLabel>Operation Type</SelectLabel> */}
          <SelectItem value="a">Type d’opération1</SelectItem>
          <SelectItem value="b">Type d’opération2</SelectItem>
          <SelectItem value="c">Type d’opération3</SelectItem>
          <SelectItem value="d">Type d’opération4</SelectItem>
          <SelectItem value="e">Type d’opération5</SelectItem>
          <SelectItem value="f">Type d’opération6</SelectItem>
        {/* </SelectGroup> */}
      </SelectContent>
    </Select>
  )
}
