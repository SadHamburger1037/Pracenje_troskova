import { createEffect, createSignal, For, onMount, Show, Suspense } from "solid-js"
import { supabase } from "../servisi/supabase"
import { valuta } from "../App";
import { UseAuth } from "../components/AuthProvider";
import { endOfMonth, endOfWeek, endOfYear, format, formatDate, startOfMonth, startOfWeek, startOfYear } from "date-fns";

export default function PrikazTroskova(props) {

    const session = UseAuth()

    const [troskovi, setTroskovi] = createSignal([]);
    const [sveukupniTrosak, setSveukupniTrosak] = createSignal(0);
    const [rasponOdabir, setRasponOdabir] = createSignal("Mjesec");
    const [rasponDatum, setRasponDatum] = createSignal([formatDate(startOfMonth(Date.now()), "yyyy-MM-dd"), formatDate(endOfMonth(Date.now()), "yyyy-MM-dd")])

    async function prikazivanje() {
        if (!rasponDatum()) {
            var { data, error } = await supabase
                .from('Troskovi')
                .select('*')
                .eq('author_id', session().user.id)
        } else {
            var { data, error } = await supabase
                .from('Troskovi')
                .select('*')
                .eq('author_id', session().user.id)
                .gte('datum_troska', rasponDatum()[0])
                .lte('datum_troska', rasponDatum()[1])
        }

        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
            for (let i = 0; i < data.length; i++) {
                let { data: data2, error2 } = await supabase
                    .from('Vrste_troskova')
                    .select('*')
                    .eq('id', data[i].vrsta_troska);
                data[i].vrsta_troska = data2[0].ime
                data[i].boja = data2[0].boja
            }
            setTroskovi(data)
        }

        setSveukupniTrosak(0)

        for (let i = 0; i < data.length; i++) {
            setSveukupniTrosak(old => old + data[i].kolicina)
        }
    }

    async function brisanjeTroska(trosakID) {
        const { error } = await supabase
            .from('Troskovi')
            .delete()
            .eq('id', trosakID)
        if (error) {
            alert("Brisanje nije uspijelo")
        } else {
            await prikazivanje();
        }
    }

    function odabirRaspona() {
        if (rasponOdabir() == "Mjesec") {
            raspon1 = document.getElementById("raspon1").value
            const pocetakMjeseca = format(startOfMonth(raspon1), "yyyy-MM-dd")
            const krajMjeseca = format(endOfMonth(raspon1), "yyyy-MM-dd")
            setRasponDatum([pocetakMjeseca, krajMjeseca])
            return 0
        } if (rasponOdabir() == "Godina") {
            raspon1 = document.getElementById("raspon1").value
            const pocetakGodine = format(startOfYear(raspon1), "yyyy-MM-dd")
            const krajGodine = format(endOfYear(raspon1), "yyyy-MM-dd")
            setRasponDatum([pocetakGodine, krajGodine])
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


    createEffect(async () => {
        await prikazivanje()
    })



    return (
        <>
            <div>
                <div class="m-2 text-xl">Odaberite raspon</div>
                <select class="select select-bordered w-full max-w-xs m-2" id="odabirRaspona" onchange={() => setRasponOdabir(document.getElementById("odabirRaspona").value)}>
                    <option selected>Mjesec</option>
                    <option>Godina</option>
                    <option>Tjedan</option>
                    <option>Dan</option>
                    <option onclick={() => odabirRaspona()}>Svi troškovi</option>
                    <option>Prilagođeni raspon</option>
                </select>
                <Show when={rasponOdabir() != "Svi troškovi"}>
                    <input type="date" id="raspon1" class="input input-bordered w-full max-w-xs m-2" onchange={() => odabirRaspona()} />
                </Show>
                <Show when={rasponOdabir() == "Prilagođeni raspon"}>
                    <input type="date" id="raspon2" class="input input-bordered w-full max-w-xs m-2" onchange={() => odabirRaspona()} />
                </Show>
            </div>
            <Show when={troskovi().length > 0} fallback={
                <div role="alert" class="alert alert-info  m-10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        class="h-6 w-6 shrink-0 stroke-current">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Nema troškova</span>
                </div>
            }>
                <div class="overflow-x-auto">
                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Vrsta</th>
                                <th>Trošak</th>
                                <th>Datum Troška</th>
                                <th>Datum Unosa</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={troskovi()}>
                                {(item) =>
                                    <tr>
                                        <td class="flex flex-col items-center"><div style={`background-color: ${item.boja}`} class="p-2 rounded-2xl flex-none">{item.vrsta_troska}</div></td>
                                        <td>{item.kolicina} {valuta}</td>
                                        <td>{new Date(item.datum_troska).toLocaleDateString()}</td>
                                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td><button class="btn btn-outline btn-error" onclick={() => { brisanjeTroska(item.id) }}>Briši</button></td>
                                    </tr>
                                }
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>
            <Show when={sveukupniTrosak()}>
                <div role="alert" class="alert alert-info m-10 text-2xl">
                    <span>Ukupan trošak: {sveukupniTrosak()} {valuta}</span>
                </div>
            </Show>
            <Show when={!session()}>
                <div class="w-full flex justify-center">
                    <div role="alert" class="alert alert-error w-80 text-xl m-20 flex justify-center">
                        <span class="max-w-80 flex">Niste prijavljeni!</span>
                    </div>
                </div>
            </Show>
        </>
    )
}