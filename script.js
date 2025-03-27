// Struttura dati per memorizzare le stanze e le finestre
let rooms = [];

// Elementi DOM
const roomNameInput = document.getElementById('room-name');
const roomAreaInput = document.getElementById('room-area');
const addRoomButton = document.getElementById('add-room');
const windowSection = document.getElementById('window-section');
const windowRoomSelect = document.getElementById('window-room');
const windowHeightInput = document.getElementById('window-height');
const windowWidthInput = document.getElementById('window-width');
const windowTypeSelect = document.getElementById('window-type');
const addWindowButton = document.getElementById('add-window');
const roomsList = document.getElementById('rooms-list');
const calculateButton = document.getElementById('calculate-ratio');
const resultsTable = document.getElementById('results-table');
const resultsBody = document.getElementById('results-body');
const exportButton = document.getElementById('export-results');

// Avvolgo tutto il codice in un event listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente caricato');
    console.log('Elementi DOM:', {
        roomNameInput,
        roomAreaInput,
        addRoomButton,
        windowSection,
        windowRoomSelect,
        windowHeightInput,
        windowWidthInput,
        windowTypeSelect,
        addWindowButton,
        roomsList,
        calculateButton,
        resultsTable,
        resultsBody
    });
    
    // Evento per aggiungere una stanza
    addRoomButton.addEventListener('click', () => {
        console.log('Pulsante Aggiungi Stanza cliccato');
        const name = roomNameInput.value.trim();
        const area = parseFloat(roomAreaInput.value);
        
        if (!name) {
            alert('Inserisci il nome della stanza');
            return;
        }
        
        if (isNaN(area) || area <= 0) {
            alert('Inserisci una superficie valida');
            return;
        }
        
        // Aggiungi la stanza all'array
        const room = {
            id: Date.now(), // ID univoco basato sul timestamp
            name,
            area,
            windows: []
        };
        
        rooms.push(room);
        
        // Aggiorna l'interfaccia
        updateRoomsList();
        updateRoomSelect();
        
        // Mostra la sezione per aggiungere finestre
        windowSection.style.display = 'block';
        
        // Resetta i campi del form
        roomNameInput.value = '';
        roomAreaInput.value = '';
    });

    // Evento per aggiungere una finestra
    addWindowButton.addEventListener('click', () => {
        const roomId = parseInt(windowRoomSelect.value);
        const height = parseFloat(windowHeightInput.value);
        const width = parseFloat(windowWidthInput.value);
        const type = windowTypeSelect.value;
        
        if (isNaN(height) || height <= 0) {
            alert('Inserisci un\'altezza valida');
            return;
        }
        
        if (isNaN(width) || width <= 0) {
            alert('Inserisci una larghezza valida');
            return;
        }
        
        // Trova la stanza selezionata
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // Aggiungi la finestra alla stanza
        const window = {
            id: Date.now(),
            height,
            width,
            type,
            area: height * width
        };
        
        room.windows.push(window);
        
        // Aggiorna l'interfaccia
        updateRoomsList();
        
        // Mostra il pulsante per calcolare il rapporto
        calculateButton.style.display = 'block';
        
        // Resetta i campi del form
        windowHeightInput.value = '';
        windowWidthInput.value = '';
    });

    // Evento per calcolare il rapporto
    calculateButton.addEventListener('click', () => {
        calculateRatios();
        resultsTable.style.display = 'block';
        exportButton.style.display = 'block';
    });
    
    // Evento per esportare i risultati come immagine
    exportButton.addEventListener('click', () => {
        console.log('Pulsante Esporta cliccato');
        
        // Mostra un messaggio di caricamento
        const loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Generazione immagine in corso...';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.padding = '15px';
        loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.zIndex = '1000';
        document.body.appendChild(loadingMessage);
        
        // Seleziona la tabella da catturare - seleziona direttamente la tabella invece di cercarla nel contenitore
        const tableElement = document.querySelector('#results-table table');
        
        if (!tableElement) {
            console.error('Elemento tabella non trovato');
            alert('Errore: Impossibile trovare la tabella da esportare');
            document.body.removeChild(loadingMessage);
            return;
        }
        
        // Assicuriamoci che html2canvas sia caricato
        if (typeof html2canvas !== 'function') {
            console.error('html2canvas non è disponibile');
            alert('Errore: La libreria di esportazione non è disponibile');
            document.body.removeChild(loadingMessage);
            return;
        }
        
        // Piccolo ritardo per permettere al messaggio di caricamento di essere visualizzato
        setTimeout(() => {
            try {
                console.log('Avvio cattura con html2canvas');
                // Opzioni aggiuntive per html2canvas per migliorare la compatibilità
                const options = {
                    scale: 2, // Scala maggiore per migliore qualità
                    useCORS: true, // Permette di caricare immagini da altri domini
                    allowTaint: true, // Permette di includere immagini potenzialmente non sicure
                    backgroundColor: '#ffffff' // Sfondo bianco
                };
                
                // Usa html2canvas per catturare la tabella come immagine
                html2canvas(tableElement, options).then(canvas => {
                    console.log('Canvas generato con successo');
                    // Converti il canvas in URL dati
                    const imageData = canvas.toDataURL('image/png');
                    
                    // Crea un link per il download
                    const downloadLink = document.createElement('a');
                    downloadLink.href = imageData;
                    downloadLink.download = 'rapporto-aero-illuminante.png';
                    
                    // Aggiungi il link al documento e simula il click
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    
                    // Rimuovi il link dal documento
                    document.body.removeChild(downloadLink);
                    document.body.removeChild(loadingMessage);
                    console.log('Download completato');
                }).catch(error => {
                    console.error('Errore durante la generazione del canvas:', error);
                    alert('Errore durante l\'esportazione: ' + error.message);
                    document.body.removeChild(loadingMessage);
                });
            } catch (error) {
                console.error('Errore durante l\'esportazione:', error);
                alert('Errore durante l\'esportazione: ' + error.message);
                document.body.removeChild(loadingMessage);
            }
        }, 100);
    });
});

// Funzione per aggiornare la lista delle stanze
function updateRoomsList() {
    roomsList.innerHTML = '';
    
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        const roomHeader = document.createElement('div');
        roomHeader.className = 'room-header';
        
        const roomInfo = document.createElement('div');
        
        const roomTitle = document.createElement('div');
        roomTitle.className = 'room-title';
        roomTitle.textContent = room.name;
        
        const roomArea = document.createElement('div');
        roomArea.className = 'room-area';
        roomArea.textContent = `Superficie: ${room.area.toFixed(2)} m²`;
        
        roomInfo.appendChild(roomTitle);
        roomInfo.appendChild(roomArea);
        
        const deleteRoomBtn = document.createElement('button');
        deleteRoomBtn.className = 'delete-btn';
        deleteRoomBtn.textContent = 'Elimina';
        deleteRoomBtn.addEventListener('click', () => {
            rooms = rooms.filter(r => r.id !== room.id);
            updateRoomsList();
            updateRoomSelect();
            
            // Nascondi la sezione finestre se non ci sono più stanze
            if (rooms.length === 0) {
                windowSection.style.display = 'none';
                calculateButton.style.display = 'none';
                resultsTable.style.display = 'none';
            }
        });
        
        roomHeader.appendChild(roomInfo);
        roomHeader.appendChild(deleteRoomBtn);
        
        roomCard.appendChild(roomHeader);
        
        // Aggiungi le finestre della stanza
        if (room.windows.length > 0) {
            const windowsTitle = document.createElement('div');
            windowsTitle.textContent = 'Finestre:';
            windowsTitle.style.fontWeight = 'bold';
            windowsTitle.style.marginTop = '10px';
            roomCard.appendChild(windowsTitle);
            
            const windowsList = document.createElement('div');
            windowsList.className = 'windows-list';
            
            room.windows.forEach(window => {
                const windowItem = document.createElement('div');
                windowItem.className = 'window-item';
                
                const windowInfo = document.createElement('div');
                windowInfo.className = 'window-info';
                
                const windowDimensions = document.createElement('div');
                windowDimensions.textContent = `${window.width.toFixed(2)} m × ${window.height.toFixed(2)} m = ${window.area.toFixed(2)} m²`;
                
                const windowType = document.createElement('div');
                windowType.className = 'window-type';
                windowType.textContent = window.type === 'transparent' ? 'Trasparente (Aerante e Illuminante)' : 'Opaca (Solo Aerante)';
                
                windowInfo.appendChild(windowDimensions);
                windowInfo.appendChild(windowType);
                
                const deleteWindowBtn = document.createElement('button');
                deleteWindowBtn.className = 'delete-btn';
                deleteWindowBtn.textContent = 'Elimina';
                deleteWindowBtn.addEventListener('click', () => {
                    room.windows = room.windows.filter(w => w.id !== window.id);
                    updateRoomsList();
                    
                    // Nascondi il pulsante di calcolo se non ci sono più finestre
                    const hasWindows = rooms.some(r => r.windows.length > 0);
                    calculateButton.style.display = hasWindows ? 'block' : 'none';
                    if (!hasWindows) {
                        resultsTable.style.display = 'none';
                    }
                });
                
                windowItem.appendChild(windowInfo);
                windowItem.appendChild(deleteWindowBtn);
                
                windowsList.appendChild(windowItem);
            });
            
            roomCard.appendChild(windowsList);
        }
        
        roomsList.appendChild(roomCard);
    });
}

// Funzione per aggiornare il select delle stanze
function updateRoomSelect() {
    windowRoomSelect.innerHTML = '';
    
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        windowRoomSelect.appendChild(option);
    });
}

// Funzione per calcolare i rapporti aero illuminanti
function calculateRatios() {
    resultsBody.innerHTML = '';
    
    rooms.forEach(room => {
        // Calcola le superfici aeranti e illuminanti
        let aeratingArea = 0;
        let illuminatingArea = 0;
        
        room.windows.forEach(window => {
            aeratingArea += window.area;
            
            // Solo le finestre trasparenti contribuiscono alla superficie illuminante
            if (window.type === 'transparent') {
                illuminatingArea += window.area;
            }
        });
        
        // Calcola i rapporti
        const aeratingRatio = aeratingArea / room.area;
        const illuminatingRatio = illuminatingArea / room.area;
        
        // Verifica se i rapporti sono conformi (1/8 = 0.125)
        const isAeratingValid = aeratingRatio >= 0.125;
        const isIlluminatingValid = illuminatingRatio >= 0.125;
        const isValid = isAeratingValid && isIlluminatingValid;
        
        // Crea la riga della tabella
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = room.name;
        
        const areaCell = document.createElement('td');
        areaCell.textContent = room.area.toFixed(2);
        
        const aeratingAreaCell = document.createElement('td');
        aeratingAreaCell.textContent = aeratingArea.toFixed(2);
        
        const illuminatingAreaCell = document.createElement('td');
        illuminatingAreaCell.textContent = illuminatingArea.toFixed(2);
        
        const aeratingRatioCell = document.createElement('td');
        aeratingRatioCell.textContent = aeratingRatio.toFixed(3);
        aeratingRatioCell.className = isAeratingValid ? 'success' : 'failure';
        
        const illuminatingRatioCell = document.createElement('td');
        illuminatingRatioCell.textContent = illuminatingRatio.toFixed(3);
        illuminatingRatioCell.className = isIlluminatingValid ? 'success' : 'failure';
        
        const validationCell = document.createElement('td');
        validationCell.textContent = isValid ? 'CONFORME' : 'NON CONFORME';
        validationCell.className = isValid ? 'success' : 'failure';
        
        row.appendChild(nameCell);
        row.appendChild(areaCell);
        row.appendChild(aeratingAreaCell);
        row.appendChild(illuminatingAreaCell);
        row.appendChild(aeratingRatioCell);
        row.appendChild(illuminatingRatioCell);
        row.appendChild(validationCell);
        
        resultsBody.appendChild(row);
    });
}