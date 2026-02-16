import fs from 'fs';
import path from 'path';

const districts = [
    "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
    "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
    "Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
    "Brahmanbaria", "Comilla", "Chandpur", "Lakshmipur", "Noakhali", "Feni", "Khagrachhari", "Rangamati", "Bandarban", "Chattogram", "Cox's Bazar",
    "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj",
    "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
    "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
    "Jamalpur", "Mymensingh", "Netrokona", "Sherpur"
];

const camps = [
    "Camp 1E", "Camp 1W", "Camp 2E", "Camp 2W", "Camp 3", "Camp 04", "Camp 4 Ext", "Camp 5", "Camp 6", "Camp 7",
    "Camp 8E", "Camp 8W", "Camp 9", "Camp 10", "Camp 11", "Camp 12", "Camp 13", "Camp 14", "Camp 15", "Camp 16",
    "Camp 17", "Camp 18", "Camp 19", "Camp 20", "Camp 20 Ext", "Camp 21", "Camp 22", "Camp 23", "Camp 24",
    "Camp 25", "Camp 26", "Camp 27", "Kutupalong RC", "Nayapara RC"
];

const blockLetters = ["A", "B", "C", "D", "E", "F"];
const subBlockNumbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

const locations = {
    bangladeshi: {
        districts: districts.sort().map(d => ({
            name: d,
            upazilas: d === "Cox's Bazar" ? [
                "Ukhiya", "Teknaf", "Ramu", "Chakaria", "Pekua", "Maheshkhali", "Kutubdia", "Cox's Bazar Sadar"
            ] : []
        }))
    },
    rohingya: {
        camps: camps.map(c => ({
            name: c,
            blocks: blockLetters.map(letter => ({
                name: `Block ${letter}`,
                subblocks: subBlockNumbers.map(num => `${letter}${num}`)
            }))
        }))
    }
};

const outputPath = '/home/ariful/zarish-health/src/shared/data/locations.json';
fs.writeFileSync(outputPath, JSON.stringify(locations, null, 2));
console.log(`Generated ${outputPath} successfully`);
