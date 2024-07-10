// SPDX-License-Identifier: MIT

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let main_div = document.getElementById('main');

let table = document.createElement("table");

function numbers_to_data(numbers) {
    const num_chars_to_bits = [0, 4, 7, 10, 13];
    const length_in_bits = Math.floor(numbers.length / 4) * 13 + num_chars_to_bits[numbers.length % 4];
    const length_in_bytes = length_in_bits / 8;
    const extra = length_in_bits % 8;
    let data = new Uint8Array(length_in_bytes);

    let offset = 0;
    let byte_off = 0;
    let rem = 0;

    for (let i = 0; i < numbers.length; i += 4) {
        let chunk = numbers.substring(i, i + 4);
        let num = Number(chunk);
        let new_length = num_chars_to_bits[chunk.length];

        let b = offset + new_length;
        if (byte_off * 8 + b >= length_in_bytes * 8) {
            console.log("last chunk", b);
            b -= extra;
        }
        if (b < 8) {
            rem += num << (8 - b);
            offset = b;
        } else if (b < 16) {
            data[byte_off] = rem + (num >> (b - 8));
            byte_off++;
            rem = (num << (16 - b)) & 0xff;
            offset = (b - 8);
        } else {
            data[byte_off] = rem + (num >> (b - 8));
            byte_off++;
            data[byte_off] = num >> (b - 16);
            byte_off++;
            rem = num << (24 - b) & 0xff;
            offset = (b - 16);
        }
    }
    return data;
}

function add_info(name, param) {
    const value = urlParams.get(param);
    let tr = document.createElement("tr");
    let nameCell = document.createElement("td");
    nameCell.textContent = name;
    tr.appendChild(nameCell);
    if (value) {
        let valueCell = document.createElement("td");
        valueCell.innerHTML = "&emsp;" + value;
        tr.appendChild(valueCell);
        table.appendChild(tr);
    }
}

add_info("Arch", "a");
add_info("Version", "v");
add_info("Distribution", "d");
main_div.appendChild(table)

const numbers = urlParams.get("zl");
data = numbers_to_data(numbers);
uncompressed = pako.inflate(new Uint8Array(data));
text = String.fromCharCode.apply(null, uncompressed);

kmsg = document.createElement("p");
kmsg.appendChild(document.createTextNode(text));
main_div.appendChild(kmsg);
