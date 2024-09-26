document.addEventListener('DOMContentLoaded', function () {
  const regionSelect = document.getElementById('region');
  const errorsSlider = document.getElementById('errors-slider');
  const errorsNumber = document.getElementById('errors-number');
  const seedInput = document.getElementById('seed');
  const randomSeedButton = document.getElementById('random-seed');
  const dataBody = document.getElementById('data-body');
  const loading = document.getElementById('loading');
  const exportCsvButton = document.getElementById('export-csv');

  let currentPage = 1;
  let loadingData = false;
  let allData = []; // Store all fetched records for infinite scroll
  const pageSize = 20; // Number of records to fetch initially and for each subsequent page

  // Sync slider and number input
  errorsSlider.addEventListener('input', () => {
    errorsNumber.value = errorsSlider.value;
    updateDisplayedData(); // Reapply errors to all displayed data
  });

  errorsNumber.addEventListener('input', () => {
    errorsSlider.value = errorsNumber.value;
    updateDisplayedData(); // Reapply errors to all displayed data
  });

  regionSelect.addEventListener('change', () => {
    resetAndFetchData(); // Fetch fresh data on region change
  });

  seedInput.addEventListener('input', () => {
    resetAndFetchData(); // Fetch fresh data on seed change
  });

  randomSeedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 100000);
    resetAndFetchData(); // Fetch fresh data on random seed change
  });

  // Reset the data and fetch the first page
  function resetAndFetchData() {
    currentPage = 1; // Reset to the first page
    dataBody.innerHTML = ''; // Clear the table
    allData = []; // Clear all stored data for infinite scroll
    fetchData(); // Fetch new data
  }

  // Fetch data for the current page
  async function fetchData() {
    if (loadingData) return; // Prevent multiple calls while loading
    loadingData = true; // Set loading state

    const region = regionSelect.value;
    const errors = errorsSlider.value; // Get current error amount
    const seed = seedInput.value;

    loading.style.display = 'block'; // Show loading spinner

    const response = await fetch(`/api/data?region=${region}&errors=${errors}&seed=${seed}&page=${currentPage}&pageSize=${pageSize}`);
    
    if (!response.ok) {
      console.error('Failed to fetch data', response);
      loading.style.display = 'none';
      loadingData = false;
      return;
    }

    const data = await response.json();
    
    loading.style.display = 'none';

    if (data.length === 0) {
      console.warn('No more data available');
      loadingData = false;
      return;
    }

    // Append newly fetched data to the existing data array
    allData = allData.concat(data); 

    updateDisplayedData(); // Apply errors and display all the data

    currentPage++; // Increment page for next load
    loadingData = false; // Reset loading state
  }

  // Update displayed data and apply errors
  function updateDisplayedData() {
    dataBody.innerHTML = ''; // Clear the previous data

    // Apply errors to the full dataset (allData) based on the error count
    const dataWithErrors = applyErrors(allData, errorsSlider.value);

    dataWithErrors.forEach(record => {
        const row = `<tr>
            <td>${record.index}</td>
            <td>${record.randomId}</td>
            <td>${record.name}</td>
            <td>${record.address}</td>
            <td>${record.phone}</td>
        </tr>`;
        dataBody.innerHTML += row; // Append new data
    });
  }

  // Function to apply errors to each record
  function applyErrors(data, errorCount) {
    return data.map(record => {
      let newRecord = { ...record }; // Copy the record
      const fields = ['name', 'address', 'phone']; // Fields to apply errors to

      // Apply a number of errors based on the slider value
      for (let i = 0; i < errorCount; i++) {
        const errorType = Math.floor(Math.random() * 3); // 3 types of errors: delete, add, swap
        const randomField = fields[Math.floor(Math.random() * fields.length)]; // Randomly pick a field (name, address, or phone)
        const fieldValue = newRecord[randomField];
        
        if (fieldValue.length === 0) continue; // Skip empty values

        const randomIndex = Math.floor(Math.random() * fieldValue.length); // Random index for error application
        switch (errorType) {
          case 0: // Delete character
            newRecord[randomField] = fieldValue.slice(0, randomIndex) + fieldValue.slice(randomIndex + 1);
            break;
          case 1: // Add character
            const charToAdd = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Random lowercase letter
            newRecord[randomField] = fieldValue.slice(0, randomIndex) + charToAdd + fieldValue.slice(randomIndex);
            break;
          case 2: // Swap characters
            if (randomIndex < fieldValue.length - 1) {
              const nextChar = fieldValue[randomIndex + 1];
              newRecord[randomField] = fieldValue.slice(0, randomIndex) + nextChar + fieldValue[randomIndex] + fieldValue.slice(randomIndex + 2);
            }
            break;
        }
      }

      return newRecord;
    });
  }

  // Handle infinite scrolling: Load more records when reaching the bottom
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loadingData) {
      fetchData(); // Load the next page of data
    }
  });

  // Export data to CSV
  exportCsvButton.addEventListener('click', async () => {
    const region = regionSelect.value;
    const errors = errorsSlider.value;
    const seed = seedInput.value;

    const url = `/api/export-csv?region=${region}&errors=${errors}&seed=${seed}`;
    window.location.href = url;  // Redirect to download CSV
  });

  // Fetch the initial data on page load
  fetchData();
});
