import axios from 'axios';

async function testApi() {
    try {
        console.log('Testing Search API...');
        const res = await axios.get('http://localhost:3000/api/medicines/search?limit=10');

        if (!res.data.success) {
            console.error('API failed:', res.data);
            return;
        }

        const medicines = res.data.data;
        console.log(`Received ${medicines.length} medicines.`);

        const noImage = medicines.filter((m: any) => !m.image_url || m.image_url.trim() === '');

        if (noImage.length > 0) {
            console.error('❌ Found medicines without images:', noImage.map((m: any) => m.name));
        } else {
            console.log('✅ All returned medicines have images.');
        }

        if (medicines.length > 0) {
            console.log('Sample Image URL:', medicines[0].image_url);
        }

    } catch (err: any) {
        console.error('❌ API Error:', err.message);
    }
}

testApi();
