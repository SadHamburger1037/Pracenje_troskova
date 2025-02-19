import { createEffect, createSignal } from "solid-js"
import { supabase } from "../servisi/supabase"
import { UseAuth } from "../components/AuthProvider"

export default function UpravljanjeVrstama(props) {

    const session = UseAuth()

    let [vrste, setVrste] = createSignal([])

    async function prikazVrsta() {
        let { data, error } = await supabase
            .from('Vrste_troskova')
            .select('*')
            .eq('author_id', session().user.id)
        if (error) {
            alert("Dogodila se greška, pokušajte ponovo :(")
        } else {
            setVrste(data)
        }
    }

    async function brisanjeVrste(vrstaID) {
        const { error } = await supabase
            .from('Vrste_troskova')
            .delete()
            .eq('id', vrstaID)
        if (error) {
            alert("Brisanje nije uspijelo")
        } else {
            await prikazVrsta();
        }
    }

    async function formSubmitVrsta(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const ime = formData.get("ime")
        const boja = formData.get("boja")
    
        const { data, error } = await supabase
            .from('Vrste_troskova')
            .insert([{
                ime: ime,
                boja: boja,
                author_id: session().user.id
            }])
            .select()
        if (!error) {
            event.target.reset()
           await prikazVrsta()
        } else {
            alert("Spremanje nije uspijelo :(")
        }
    
    }

    createEffect(async () => {
        await prikazVrsta()
    })

    return (
        <>
            <div class="text-3xl text-center mt-10">Upisivanje Vrste</div>
                <form onSubmit={formSubmitVrsta} class="flex flex-col navbar-center mt-10">
                    <input type="text" name="ime" placeholder={"Unesite ime:"} class="input input-bordered w-full max-w-xs m-2" required="" />
                    <input type="color" name="boja" class="input input-bordered w-full max-w-xs m-2" required="" />
                    <button type="submit" class="btn btn-ghost text-xl mt-3.5">Unesi</button>
                </form>
            <Show when={vrste().length > 0} fallback={
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
                    <span>Nema Vrsta</span>
                </div>
            }>
                <div class="overflow-x-auto">
                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={vrste()}>
                                {(item) =>
                                    <tr>
                                        <td class="flex flex-col items-center"><div style={`background-color: ${item.boja}`} class="p-2 rounded-2xl flex-none">{item.ime}</div></td>
                                        <td><button class="btn btn-outline btn-error" onclick={() => { brisanjeVrste(item.id) }}>Briši</button></td>
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