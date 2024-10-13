/* Qui abbiene l'inizializzazione dell'evento DOMContentLoaded ossia quando la pagina HTML
è stata completamente caricata (senza attendere il caricamento delle risorse come immagini),
viene eseguito questo blocco di codice. Questo è utile perché garantisce
che il DOM sia completamente disponibile prima di manipolarlo con JavaScript. */
document.addEventListener('DOMContentLoaded', () => {
    //Inizializzo lessonSelect con il riferimento all'elemento <select> dove saranno popolate le lezioni.
    const lessonSelect = document.getElementById('lesson-select');
    //Inizializzo reservationContainer con il contenitore per visualizzare le prenotazioni effettuate.
    const reservationContainer = document.getElementById('reservations-container');
    // Il form che l’utente utilizza per fare una nuova prenotazione.
    const form = document.getElementById('booking-form');
    // Variabile che traccia se si sta modificando una prenotazione.
    // È impostata a null inizialmente (nessuna modifica).
    let editingReservationId = null;

    // Funzione per popolare il select con le lezioni dinamicamente dal backend
    function populateLessonSelect() {
        // Qui viene fatta una chiamata HTTP GET all’endpoint api/lessons.
        fetch('http://127.0.0.1:5000/api/lessons')
            .then(response => response.json())
            .then(data => {
                // Se la risposta è corretta, il menu a tendina viene svuotato (lessonSelect.innerHTML = '';).
                lessonSelect.innerHTML = '';
                //vengono aggiunte nuove opzioni dinamicamente per ciascuna lezione.
                data.forEach(lesson => {
                    const lessonOption = document.createElement('option');
                    lessonOption.value = lesson.id;
                    lessonOption.textContent = `${lesson.name} - ${lesson.time}`;
                    lessonSelect.appendChild(lessonOption);
                });
            })
            .catch(error => {
                //Se c’è un errore nella richiesta, viene mostrata un’opzione di errore.
                console.error('Errore nel recupero delle lezioni:', error);
                lessonSelect.innerHTML = '<option disabled>Errore nel caricamento delle lezioni</option>';
            });
    }

    // Richiama la funzione per popolare il select con i corsi quando il documento è pronto
    populateLessonSelect();


    // Funzione per formattare la data da yyyy-mm-dd a dd/mm/yyyy
    function formatDate(dateString) {
        // Separo la i numeri della data con uno split appena trova un "-",
        const [year, month, day] = dateString.split('-');
        // Concateno nel modo giusto la data.
        return `${day}/${month}/${year}`;
    }

    // Funzione per formattare la data da dd/mm/yyyy a yyyy-mm-dd (formato richiesto dall'input date)
    function reverseFormatDate(dateString) {
        // Separo la i numeri della data con uno split appena trova un "-",
        const [day, month, year] = dateString.split('/');
        // Concateno nel modo giusto la data.
        return `${year}-${month}-${day}`;
    }

    // Funzione per eliminare una prenotazione
    function deleteReservation(reservationId) {
        // Qui viene fatta una chiamata HTTP DELETE verso l’API delete/${reservationId}.
        fetch(`http://127.0.0.1:5000/api/delete/${reservationId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            // Se la cancellazione ha successo, la lista delle prenotazioni viene aggiornata chiamando
            // updateReservations altrimenti viene mostrato un messaggio di errore.
            if (data.success) {
                updateReservations();  // Aggiorna la lista delle prenotazioni
            } else {
                console.error('Errore nella cancellazione:', data.message);
            }
        })
        .catch(error => {
            console.error('Errore durante la cancellazione:', error);
        });
    }

    // Funzione per modificare una prenotazione
    function editReservation(reservation) {
        // La variabile editingReservationId viene aggiornata con l’ID della prenotazione
        // che si desidera modificare.
        editingReservationId = reservation.id;
        // Qui viene l'input del nome, cognome, lezione e data vengono sostituiti grazie al loro
        // ID preso con il getElementById e inizializzati con il valore di reservation
        document.getElementById('user-name').value = reservation.name;
        document.getElementById('user-surname').value = reservation.surname;
        lessonSelect.value = reservation.lesson.id;
        // Qui si precompila la data prendendo la data e usando la funzione formatDate e poi reverseFormatDate
        // questo perche reverseFormatDate inverte la formattazione precedente per riportare la data nel formato ISO.
        document.getElementById('lesson-date').value = reverseFormatDate(formatDate(reservation.date));
    }

    // Funzione per aggiornare le prenotazioni
    function updateReservations() {
        // Qui viene fatta una richiesta GET all'API reservations.
        fetch('http://127.0.0.1:5000/api/reservations')
            .then(response => response.json())
            .then(data => {
                //Svuota il contenitore delle prenotazioni.
                reservationContainer.innerHTML = '';

                if (data.length === 0) {
                    // Se non ci sono prenotazioni ti avviso con un messaggio
                    reservationContainer.textContent = 'Non ci sono prenotazioni al momento.';
                } else {
                    //Se ci sono prenotazioni, le visualizza con i dettagli.
                    data.forEach(reservation => {
                        //SI crea un elemento <div> HTML, che sarà usato per visualizzare le informazioni
                        //della prenotazione (nome del cliente, lezione e data).
                        const reservationDiv = document.createElement('div');
                        //SI crea un elemento HTML <br>, che aggiungerà una linea vuota tra le diverse prenotazioni.
                        //È un piccolo dettaglio estetico per separare visivamente le informazioni.
                        const space = document.createElement('br');
                        //Usa la funzione formatDate (definita precedentemente) per convertire la data della
                        //prenotazione da formato yyyy-mm-dd (ad esempio, 2023-09-21) a
                        //formato dd/mm/yyyy (ad esempio, 21/09/2023), che è più leggibile per l'utente.
                        const formattedDate = formatDate(reservation.date);
                        //Imposta il testo del div creato con le informazioni della prenotazione. Il testo include:
                        //il nome del cliente che ha prenotato, il nome, l'orario e la data della prenotazione,
                        //della lezione
                        reservationDiv.textContent = `${reservation.name} ${reservation.surname} ha prenotato per ${reservation.lesson.name} alle ${reservation.lesson.time} in data ${formattedDate}`;
                        //Aggiungo un ID a reservationDiv assegnato al div per identificarlo,
                        //utilizzato per applicare stili.
                        reservationDiv.id = 'info-reservation';

                        // Creo un pulsante "Elimina"
                        const deleteButton = document.createElement('button');
                        // Assegno il testo "Elimina" e gli assegna un ID delete.
                        deleteButton.textContent = 'Elimina';
                        deleteButton.id = 'delete';
                        // Aggiungo un event listener al pulsante "Elimina". Quando l'utente clicca
                        // su questo pulsante, viene chiamata la funzione deleteReservation,
                        // che prende come argomento l'ID della prenotazione corrente (reservation.id)
                        // e la elimina dal server.
                        deleteButton.addEventListener('click', () => {
                            deleteReservation(reservation.id);
                        });

                        // Creo un pulsante "Modifica" con il testo "Modifica" e gli assegna un ID edit.
                        // Questo pulsante sarà utilizzato per permettere la modifica della prenotazione.
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Modifica';
                        editButton.id = 'edit';
                        // Aggiunge un event listener al pulsante "Modifica". Quando l'utente clicca
                        // su questo pulsante, viene chiamata la funzione editReservation che precompila
                        // il form con i dati della prenotazione corrente (nome, cognome, lezione, data),
                        // permettendo di modificarli.
                        editButton.addEventListener('click', () => {
                            editReservation(reservation);
                        });

                        // Gli elementi creati (pulsante "Elimina", pulsante "Modifica", div con le informazioni della
                        // prenotazione e spazio <br>) vengono aggiunti all'interno del contenitore delle prenotazioni
                        // (reservationContainer).
                        reservationContainer.appendChild(deleteButton);
                        reservationContainer.appendChild(editButton);
                        reservationContainer.appendChild(reservationDiv);
                        reservationContainer.appendChild(space);
                    });
                }
            })
            .catch(error => {
                console.error('Errore nel recupero delle prenotazioni:', error);
                reservationContainer.textContent = 'Errore nel recupero delle prenotazioni.';
            });
    }

    // Gestione della prenotazione e aggiornamento
    form.addEventListener('submit', (e) => {
        //Questa linea impedisce che il comportamento predefinito del form
        //(inviare una richiesta HTTP GET o POST e ricaricare la pagina) venga eseguito.
        //Invece di ricaricare la pagina, il submit sarà gestito interamente tramite JavaScript.
        e.preventDefault();

        //Viene estratto il valore da ciascun campo del form.
        const selectedLessonId = lessonSelect.value; // ID della lezione selezionata nel campo <select>.
        const userName = document.getElementById('user-name').value; // Il valore inserito dall'utente nel campo "Nome".
        const userSurname = document.getElementById('user-surname').value; // Il valore inserito dall'utente nel campo "Surname".
        const lessonDate = document.getElementById('lesson-date').value; // La data selezionata dall'utente nel campo di tipo date.

        // Qui si determina l'URL, se editingReservationId è diverso da null,
        // significa che l'utente sta modificando una prenotazione esistente, quindi viene utilizzato
        // l'URL di aggiornamento (/api/update/{id}), dove {id} è l'ID della prenotazione da modificare.
        // Se editingReservationId è null, significa che si sta creando una nuova prenotazione,
        // quindi l'URL sarà /api/book (per creare una nuova prenotazione).
        const url = editingReservationId
            ? `http://127.0.0.1:5000/api/update/${editingReservationId}`  // Se si sta modificando, usa la rotta di aggiornamento
            : 'http://127.0.0.1:5000/api/book';  // Altrimenti, crea una nuova prenotazione

        // Qui si determina il metodo HTTP da utilizzare, se si sta modificando una prenotazione esistente,
        // il metodo HTTP sarà PUT, che viene comunemente usato per aggiornare risorse esistenti.
        // Se si sta creando una nuova prenotazione, il metodo sarà POST, utilizzato per creare nuove risorse.
        const method = editingReservationId ? 'PUT' : 'POST';

        // Si esegue una richiesta HTTP al server utilizzando l'API fetch
        // Si usa un URL costruito precedentemente (/api/update/{id} o /api/book).
        // l'headers specifica che il corpo della richiesta è in formato JSON ('Content-Type': 'application/json').
        // Nel Body i dati raccolti dal form (ID della lezione, nome dell'utente, cognome e data della lezione)
        // vengono convertiti in formato JSON tramite JSON.stringify() e inviati come corpo della richiesta.
        // Questi dati saranno utilizzati dal server per gestire la prenotazione o l'aggiornamento.
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lessonId: selectedLessonId,
                name: userName,
                surname: userSurname,
                date: lessonDate
            })
        })
        // Una volta che il server risponde, la risposta viene convertita in formato JSON con .json()
        // per poterla manipolare facilmente in JavaScript. Il risultato JSON contiene solitamente uno
        // stato di successo (success: true/false) e, eventualmente, altri dati di ritorno.
        .then(response => response.json())
        // Una volta ottenuta la risposta dal server (data), il codice aggiorna l'interfaccia utente
        .then(data => {
          // Se la prenotazione è andata a buon fine aggiorna il testo di conferma per informare l'utente
            const confirmation = document.getElementById('confirmation');
            if (data.success) {
                confirmation.textContent = editingReservationId
                    ? 'Prenotazione modificata con successo!'
                    : 'Prenotazione avvenuta con successo!';
                editingReservationId = null;  // Resetta l'ID di modifica
                form.reset();  // Resetta il form
                updateReservations();  // Aggiorna la lista delle prenotazioni
            } else {
                confirmation.textContent = 'Errore nella prenotazione.';
            }
        })
        .catch(error => {
            console.error('Errore durante la prenotazione:', error);
            document.getElementById('confirmation').textContent = 'Errore durante la prenotazione.';
        });
    });

    // Carica le prenotazioni al caricamento della pagina
    updateReservations();
});
