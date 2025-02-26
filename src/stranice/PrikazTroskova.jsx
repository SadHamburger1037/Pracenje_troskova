import { createEffect, createSignal, For, onMount, Show, Suspense } from "solid-js"
import { supabase } from "../servisi/supabase"
import { valuta } from "../App";
import { UseAuth } from "../components/AuthProvider";
import { endOfMonth, endOfWeek, endOfYear, format, formatDate, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { odabirRaspona, rasponOdabir, rasponDatum, setRasponOdabir, resetRaspon, trenutniDatum, setTrenutniDatum } from "../servisi/raspon";

export default function PrikazTroskova(props) {

    const session = UseAuth()

    const [troskovi, setTroskovi] = createSignal([]);
    const [sveukupniTrosak, setSveukupniTrosak] = createSignal(0);

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

    onMount(async () => {
        resetRaspon()
        await prikazivanje()
    })


    createEffect(async () => {


        await prikazivanje()
    })



    return (
        <>
            <div class="flex flex-col items-center">
                <div class="flex">
                    <div class="m-10 text-2xl">Odaberite raspon</div>
                    </div>
                    <div class="flex flex-row items-center w-1/2">
                    <select class="select select-bordered w-full max-w-xs m-2" id="odabirRaspona" onchange={async () => { await setRasponOdabir(document.getElementById("odabirRaspona").value); odabirRaspona() }}>
                        <option selected>Mjesec</option>
                        <option>Godina</option>
                        <option>Tjedan</option>
                        <option>Dan</option>
                        <option onclick={() => odabirRaspona()}>Svi troškovi</option>
                        <option>Prilagođeni raspon</option>
                    </select>
                    
                    
                    <Show when={rasponOdabir() != "Svi troškovi"}>
                        <input type="date" id="raspon1" class="input input-bordered w-full max-w-xs m-2" value={trenutniDatum()} onchange={async () => { odabirRaspona(); setTrenutniDatum(document.getElementById("raspon1").value) }} />
                    </Show>
                    <Show when={rasponOdabir() == "Prilagođeni raspon"}>
                        <input type="date" id="raspon2" class="input input-bordered w-full max-w-xs m-2" onchange={async () => { await odabirRaspona() }} />
                    </Show>
                    </div>
                
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
                                <th>Opis Troška</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={troskovi()}>
                                {(item) =>
                                    <tr>
                                        <td class="flex flex-col items-center text-center"><div style={`background-color: ${item.boja}`} class="p-2 rounded-2xl flex-none">{item.vrsta_troska}</div></td>
                                        <td class="w-1/5">{item.kolicina} {valuta}</td>
                                        <td class="w-1/5">{new Date(item.datum_troska).toLocaleDateString()}</td>
                                        <td class="text-wrap w-1/5"><Show when={item.opis_troska} fallback="/">{item.opis_troska}</Show></td>
                                        <td class="w-1/5"><button class="btn btn-outline btn-error" onclick={() => { brisanjeTroska(item.id) }}>Briši</button></td>
                                    </tr>
                                }
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>
            <Show when={sveukupniTrosak()}>
                <div role="alert" class="alert alert-info m-auto mt-10 text-3xl flex items-center w-fit">
                    <span class="m-auto">Ukupan trošak: {sveukupniTrosak()} {valuta}</span>
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