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

  // Sync slider and number input
  errorsSlider.addEventListener('input', () => {
    errorsNumber.value = errorsSlider.value;
    fetchData();
  });
  
  errorsNumber.addEventListener('input', () => {
    errorsSlider.value = errorsNumber.value;
    fetchData();
  });

  regionSelect.addEventListener('change', fetchData);
  seedInput.addEventListener('input', fetchData);

  randomSeedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 100000);
    fetchData();
  });

  async function fetchData() {
    const region = regionSelect.value;
    const errors = errorsSlider.value;
    const seed = seedInput.value;

    dataBody.innerHTML = '';
    loading.style.display = 'block';

    const response = await fetch(`/api/data?region=${region}&errors=${errors}&seed=${seed}`);
    const data = await response.json();
    loading.style.display = 'none';

    data.forEach(record => {
      const row = `<tr>
        <td>${record.index}</td>
        <td>${record.randomId}</td>
        <td>${record.name}</td>
        <td>${record.address}</td>
        <td>${record.phone}</td>
      </tr>`;
      dataBody.innerHTML += row;
    });
  }

  // Export data to CSV
  exportCsvButton.addEventListener('click', async () => {
    const region = regionSelect.value;
    const errors = errorsSlider.value;
    const seed = seedInput.value;

    const url = `/api/export-csv?region=${region}&errors=${errors}&seed=${seed}`;
    window.location.href = url;  // Redirect to download CSV
  });

  fetchData();
});
