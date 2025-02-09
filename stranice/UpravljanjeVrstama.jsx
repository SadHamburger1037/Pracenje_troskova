import { createEffect, createSignal } from "solid-js"
import { supabase } from "../servisi/supabase"

export default function UpravljanjeVrstama(props) {

    let [vrste, setVrste] = createSignal([])

    async function prikazVrsta() {
        let { data, error } = await supabase
            .from('Vrste_troskova')
            .select('*')
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
            console.log(error);
            
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
            .insert([
                { ime: ime, boja: boja },
            ])
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
                    <button type="submit" class="">Unesi</button>
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
                                    <tr class="justify-center items-center bg-center">
                                        <td style={`background-color: ${item.boja}; border: 1px solid black; border-radius: 20px; overflow: hidden; display: flex; max-width: 50%; align-items: center; justify-content: center; background-position: center`}>{item.ime}</td>
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