// 1. ฟังก์ชันสำหรับดึงข้อมูลจาก Database มาแสดงบนตาราง
async function getExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const data = await response.json();

    const list = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-amount');

    list.innerHTML = '';
    let total = 0; // ตัวแปรเก็บยอดรวม

    data.forEach((item) => {
      const amount = parseFloat(item.amount);
      total += amount; // บวกยอดเงินเข้าตัวแปร total

      const date = new Date(item.created_at).toLocaleDateString('th-TH');
      const row = `
                <tr>
                    <td>${date}</td>
                    <td>${item.title}</td>
                    <td>${item.category}</td>
                    <td>${amount.toLocaleString()} บาท</td>
                    <td>
                        <button class="delete-btn" onclick="deleteExpense(${item.id})">ลบ</button>
                    </td>
                </tr>
            `;
      list.innerHTML += row;
    });

    // แสดงยอดรวมแบบทศนิยม 2 ตำแหน่ง
    totalDisplay.innerText = total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// 2. ฟังก์ชันสำหรับบันทึกข้อมูลเมื่อกดปุ่ม Submit
const expenseForm = document.getElementById('expense-form');

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // ป้องกันหน้าเว็บ Refresh

  const title = document.getElementById('title').value;
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category }),
    });

    if (response.ok) {
      expenseForm.reset(); // ล้างข้อมูลในฟอร์ม
      getExpenses(); // โหลดตารางใหม่เพื่อแสดงข้อมูลล่าสุด
    }
  } catch (error) {
    console.error('Error saving expense:', error);
  }
});

let expenseIdToDelete = null; // เก็บ ID ที่ต้องการลบชั่วคราว

// ฟังก์ชันเปิด Modal
function deleteExpense(id) {
  expenseIdToDelete = id;
  document.getElementById('delete-modal').style.display = 'block';
}

// ฟังก์ชันปิด Modal
function closeModal() {
  document.getElementById('delete-modal').style.display = 'none';
  expenseIdToDelete = null;
}

// เมื่อกดยืนยันการลบใน Modal
document
  .getElementById('confirm-delete')
  .addEventListener('click', async () => {
    if (expenseIdToDelete) {
      try {
        await fetch(`/api/expenses/${expenseIdToDelete}`, { method: 'DELETE' });
        closeModal(); // ปิด Modal
        getExpenses(); // โหลดข้อมูลใหม่
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

// ปิด Modal เมื่อคลิกข้างนอกกล่อง
window.onclick = function (event) {
  const modal = document.getElementById('delete-modal');
  if (event.target == modal) {
    closeModal();
  }
};

// 3. สั่งให้โหลดข้อมูลทันทีที่เปิดหน้าเว็บ
getExpenses();
