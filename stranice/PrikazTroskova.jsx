import { createEffect, createSignal, For, onMount, Show, Suspense } from "solid-js"
import { supabase } from "../servisi/supabase"
import { valuta } from "../src/App";

export default function PrikazTroskova(props) {

    const [troskovi, setTroskovi] = createSignal([]);
    const [sveukupniTrosak, setSveukupniTrosak] = createSignal(0);

    async function prikazivanje() {

        const { data, error } = await supabase
            .from('Troskovi')
            .select('*')
        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
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

    createEffect(async () => {
        await prikazivanje()
    })


    return (
        <>
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
                                <th>Trošak</th>
                                <th>Datum Troška</th>
                                <th>Datum Unosa</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody >
                            <For each={troskovi()}>
                                {(item) =>
                                    <tr>
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

        </>
    )
}