import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJwaG9uZSI6IiIsImlhdCI6MTc3MDE4NjcwMSwiZXhwIjoxNzcwMTkwMzAxfQ.j2uK6mAYYLVjyBLKBxIkvL_Sb_PbS7Wp9cqYNWRrSq4';

async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Success:', data.success);
        console.log('Data Length:', data.data?.length);
        if (data.data?.length === 0) {
            console.log('Error:', data.error);
        }
    } catch (err) {
        console.error('Failed:', err);
    }
}

testApi();
