import { endOfMonth, endOfWeek, endOfYear, format, formatDate, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { createSignal } from "solid-js";

export const [rasponOdabir, setRasponOdabir] = createSignal("Mjesec");
export const [rasponDatum, setRasponDatum] = createSignal([formatDate(startOfMonth(Date.now()), "yyyy-MM-dd"), formatDate(endOfMonth(Date.now()), "yyyy-MM-dd")])

export function resetRaspon(){
    setRasponOdabir("Mjesec")
    setRasponDatum([formatDate(startOfMonth(Date.now()), "yyyy-MM-dd"), formatDate(endOfMonth(Date.now()), "yyyy-MM-dd")])
}

export function odabirRaspona() {
        if (rasponOdabir() == "Mjesec") {
            raspon1 = document.getElementById("raspon1").value
            const pocetakMjeseca = format(startOfMonth(raspon1), "yyyy-MM-dd")
            const krajMjeseca = format(endOfMonth(raspon1), "yyyy-MM-dd")
            setRasponDatum([pocetakMjeseca, krajMjeseca])
            console.log("u js fileu");
            
            return 0
        } if (rasponOdabir() == "Godina") {
            raspon1 = document.getElementById("raspon1").value
            const pocetakGodine = format(startOfYear(raspon1), "yyyy-MM-dd")
            const krajGodine = format(endOfYear(raspon1), "yyyy-MM-dd")
            setRasponDatum([pocetakGodine, krajGodine])
            console.log(rasponDatum);
            
            return 0
        } if (rasponOdabir() == "Tjedan") {
            raspon1 = document.getElementById("raspon1").value
            const pocetakTjedna = format(startOfWeek(raspon1), "yyyy-MM-dd")
            const krajTjedna = format(endOfWeek(raspon1), "yyyy-MM-dd")
            setRasponDatum([pocetakTjedna, krajTjedna])
            return 0
        } if (rasponOdabir() == "Dan") {
            raspon1 = document.getElementById("raspon1").value
            setRasponDatum([raspon1, raspon1])
            return 0
        } if (rasponOdabir() == "Prilagođeni raspon" && document.getElementById("raspon1").value && document.getElementById("raspon2").value) {
            raspon1 = document.getElementById("raspon1").value
            raspon2 = document.getElementById("raspon2").value
            setRasponDatum([raspon1, raspon2])
            return 0
        } else {
            setRasponDatum()
        }
    }