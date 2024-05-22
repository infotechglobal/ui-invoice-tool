import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
  
import { UserData } from "../public/assets/assets";
import { useState } from "react";
  
  export function CustomTable() {
    console.log(UserData.length)
    const rowPerPage= 8;
    const [pageNo, setPageNo]= useState(1);
    const [startIndex, setStartIndex]= useState(0);
    const [endIndex, setEndIndex]= useState(rowPerPage);
    return (
      <>      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="T-head">User Id</TableHead>
            <TableHead className="T-head">Nom client</TableHead>
            <TableHead className="T-head">Prénom client</TableHead>
            <TableHead className="T-head">Code produit</TableHead>
            <TableHead className="T-head">Descriptifs pour chaque produit facturé</TableHead>
            <TableHead className="T-head">Date de réalisation de la prestation ou de l'encaissement</TableHead>
            <TableHead className="T-head">Le montant H.T</TableHead>
            <TableHead className="T-head">Le taux de TVA</TableHead>
            <TableHead className="T-head">Le montant TTC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {UserData.slice(startIndex,endIndex).map((user) => (
            <TableRow key={user.UserID+Math.random()}>
              <TableCell className="T-data">{user.UserID}</TableCell>
              <TableCell className="T-data-name">{user.NomClient}</TableCell>
              <TableCell className="T-data-name">{user.PrenomClient}</TableCell>
              <TableCell className="T-data">{user.CodeProduit}</TableCell>
              <TableCell className="T-data">{user.DescriptifProduit}</TableCell>
              <TableCell className="T-data">{user.DatePrestation}</TableCell>
              <TableCell className="T-data">{user.MontantHT}</TableCell>
              <TableCell className="T-data">{user.TauxTVA}</TableCell>
              <TableCell className="T-data">{user.MontantTTC}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>


      <Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
       className={startIndex==0 ?"pointer-events-none opacity-50":undefined}
       onClick ={()=>{
        if(startIndex>0){
          setPageNo(pageNo-1);
        }
        console.log("prev clicked", startIndex, endIndex);
          setStartIndex(startIndex-rowPerPage);
          setEndIndex(endIndex-rowPerPage)
       }}
       />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" >{pageNo}</PaginationLink>
    </PaginationItem>
    {/* <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem> */}
    <PaginationItem>
      <PaginationNext 
      className={endIndex>=UserData.length ?"pointer-events-none opacity-50":undefined}
      onClick ={()=>{
        console.log("next clicked", startIndex, endIndex);
        if(endIndex<UserData.length){
          setPageNo(pageNo+1);
        }
        setStartIndex(startIndex+rowPerPage);
        setEndIndex(endIndex+rowPerPage)
     }}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>

      </>

    );
  }
  