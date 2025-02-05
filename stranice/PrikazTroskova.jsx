import { createEffect, createSignal, For, onMount, Show, Suspense } from "solid-js"
import { supabase } from "../servisi/supabase"
import { valuta } from "../src/App";

export default function PrikazTroskova(props) {

    const [troskovi, setTroskovi] = createSignal([]);

    async function prikazivanje() {

        const { data, error } = await supabase
            .from('Troskovi')
            .select('*')
        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
            setTroskovi(data)
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

    console.log(troskovi())

    return (
        <>
            <Show when={troskovi().length > 0}>
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

        </>
    )
}