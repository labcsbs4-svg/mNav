// Simple debug script to test events API
console.log('Testing events API...');

fetch('http://localhost:4000/api/events')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.json();
  })
  .then(data => {
    console.log('Events data:', data);
    console.log('Number of events:', data.length);
  })
  .catch(error => {
    console.error('Error fetching events:', error);
  });