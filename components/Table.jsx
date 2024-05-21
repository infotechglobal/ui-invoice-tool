import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
import { UserData } from "../public/assets/assets";
  
  export function CustomTable() {
    return (
      <Table>
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
          {UserData.map((user) => (
            <TableRow key={user.UserID}>
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
    );
  }
  