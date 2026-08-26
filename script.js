let otpTimerInterval;   // timer चालू ठेवण्यासाठी
let otpTimeLeft = 60;  // 1 minutes = 60 seconds
function startOtpTimer() {

    const timerDisplay = document.getElementById("otpTimer");
    const resendBtn = document.getElementById("resendOtpBtn");

    otpTimeLeft = 60; // प्रत्येक वेळी reset

    otpTimerInterval = setInterval(() => {

        const minutes = Math.floor(otpTimeLeft / 60);
        const seconds = otpTimeLeft % 60;

        // टाइम display (01:00 format)
        timerDisplay.innerText =
            `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

        otpTimeLeft--;

        // Timer संपला
        if (otpTimeLeft < 0) {

            clearInterval(otpTimerInterval);

            timerDisplay.innerText = "OTP Expired";

            resendBtn.style.display = "block"; // resend button show

        }

    }, 1000); // दर 1 second ला run
}
function checkVotingStatus(){

    const electionStarted = localStorage.getItem("electionStarted");

    if(electionStarted === "true"){

        const startTime = localStorage.getItem("votingStartTime");

        const duration = 3 * 60* 1000;

        const endTime = Number(startTime) + duration;

        const now = Date.now();

        if(now >= endTime){

            if(!window.location.pathname.includes("result.html")){
                window.location.href = "result.html";
            }

        }

    }

}

setInterval(checkVotingStatus,1000);
// ====================== UTILITY FUNCTIONS ======================
function togglePartyField() {
    const role = document.getElementById("role");
    const partyField = document.getElementById("partyField");
    const nominationField = document.getElementById("nominationField");

    // 👇 ADD THIS LINE
    const docLabel = document.querySelector("label[for='userImage']");

    if (role) {
        if (role.value === "group") {

            partyField.style.display = "block";
            if(aadhaarField) aadhaarField.style.display = "block";
            if(nominationField) nominationField.style.display = "block";

            // 👇 For GROUP → show Election Symbol
            if(docLabel) docLabel.innerText = "Upload Election Symbol";

        } else {

            partyField.style.display = "none";
            if(aadhaarField) aadhaarField.style.display = "none";
            if(nominationField) nominationField.style.display = "none";

            // 👇 For VOTER → show Upload Your Image
            if(docLabel) docLabel.innerText = "Upload Your Image";
        }
    }
}

function goHome() {
    window.location.href = "home.html";
}

function castVote(candidateMobile) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || user.role !== "voter") return;

    const voterKey = "voted_" + user.voterId;
    if (localStorage.getItem(voterKey)) {
        alert("You have already voted!");
        return;
    }

    let candidate = JSON.parse(localStorage.getItem("user_" + candidateMobile));
    // ⭐ Area check
if(candidate.address !== user.address){
    alert("You can vote only candidates from your area!");
    return;
}
    if (candidate) {
        candidate.voteCount = (candidate.voteCount || 0) + 1;
        localStorage.setItem("user_" + candidateMobile, JSON.stringify(candidate));
        localStorage.setItem(voterKey, "true");

        const txnId = "TXN" + Date.now();
        const proofData = { name: user.name, txn: txnId, date: new Date().toLocaleString() };
        localStorage.setItem("voteProof", JSON.stringify(proofData));

        window.location.href = "receipt.html";
    }
}// ===== SHOW / HIDE PASSWORD (SLASH ICON ONLY) =====
function togglePassword(fieldId, icon) {
    var field = document.getElementById(fieldId);

    if (!field) return;

    if (field.type === "password") {
        field.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else {
        field.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}

// ====================== DOMContentLoaded ======================
document.addEventListener('DOMContentLoaded', () => {
    const symbolInput = document.getElementById("userImage");

if (symbolInput) {
    symbolInput.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {

                window.tempSymbol = e.target.result;   // ⭐ change

                const preview = document.getElementById("voterPhoto");
                if (preview) preview.src = e.target.result;

            };

            reader.readAsDataURL(file);
        }
    });
}
const nominationInput = document.getElementById("nominationFile");
if (nominationInput) {

    nominationInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = function (e) {

                window.tempNomination = e.target.result;

            };

            reader.readAsDataURL(file);

        }

    });

}
    setTimeout(togglePartyField, 100);
    // ===== REGISTRATION ROLE CONTROL =====

const roleSelect = document.getElementById("role");

if(roleSelect){

    const electionStarted = localStorage.getItem("electionStarted");

    if(electionStarted === "true"){

        roleSelect.innerHTML = `
        <option value="voter">Voter</option>
        `;

    }
    else{

        roleSelect.innerHTML = `
        <option value="voter">Voter</option>
    <option value="group">Group</option>
    `;

    }

}
    // ===== REGISTRATION =====
    

    
    

    // ===== LOGIN =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const mobile = document.getElementById('loginMobile')?.value.trim();
            const pass = document.getElementById('loginPass')?.value.trim();
            const user = JSON.parse(localStorage.getItem("user_" + mobile));
            if (user && user.password === pass) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                window.location.href = "profile.html";
            } else { alert("Invalid mobile number or password!"); }
        };
    }

    // ===== PROFILE PAGE =====
    if (window.location.pathname.includes("profile.html")) {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) { window.location.href = "login.html"; return; }

        const voterKey = "voted_" + user.voterId;
        const hasVoted = localStorage.getItem(voterKey);

        const voterView = document.getElementById('voterView');
        const candidateGreetingView = document.getElementById('candidateGreetingView');
        const leftVoteBtn = document.getElementById('myVoteStatus');
        if (user.isRejected) {

    // 🔥 POPUP MESSAGE
    alert("❌ Your Registration has been Rejected\n\nReason: " + user.rejectReason);

    voterView && (voterView.style.display = 'none');

    const voteBtns = document.querySelectorAll(".vote-btn");
    voteBtns.forEach(btn => btn.style.display = "none");

    const leftVoteBtn = document.getElementById("myVoteStatus");
    if (leftVoteBtn) leftVoteBtn.style.display = "none";

    const container = document.getElementById("groups-container");

    if (container) {

        container.innerHTML = `
        <div style="
            text-align:center;
            padding:40px;
            font-size:20px;
            color:red;
            font-weight:bold;
        ">
            ❌ Your Registration has been Rejected <br><br>
            Reason: ${user.rejectReason}
        </div>
        `;

    }

    return;
}

  
            if (user.role === "voter" || !user.role) {
            voterView && (voterView.style.display = 'block');
            candidateGreetingView && (candidateGreetingView.style.display = 'none');
            document.getElementById('displayName') && (document.getElementById('displayName').innerText = user.name);
            document.getElementById('displayVoterId') && (document.getElementById('displayVoterId').innerText = user.voterId);
            document.getElementById('displayMobile') && (document.getElementById('displayMobile').innerText = user.mobile);
            document.getElementById('displayAddress') && (document.getElementById('displayAddress').innerText = user.address);
            document.getElementById('displayGender') && (document.getElementById('displayGender').innerText = user.gender);
            document.getElementById('displayRole') && (document.getElementById('displayRole').innerText = user.role);
            document.getElementById('displayPhoto') && (document.getElementById('displayPhoto').src = user.image || "");

            if (leftVoteBtn) {
                leftVoteBtn.style.display = "block";
                leftVoteBtn.innerText = hasVoted === "true" ? "Voted" : "Vote";
                leftVoteBtn.disabled = hasVoted === "true";
            }
        } else {
    voterView && (voterView.style.display = 'none');
    
    leftVoteBtn && (leftVoteBtn.style.display = 'none');
            if (candidateGreetingView) {
                candidateGreetingView.style.display = 'block';
                const greetingTitle = candidateGreetingView.querySelector('h1');
                greetingTitle && (greetingTitle.innerText = "Welcome, " + user.name + "!");
            }
        }

        // ===== Display Approved Groups =====
        const container = document.getElementById("groups-container");
        if (container) {
            container.innerHTML = "";
            let candidates = [];

// Collect candidates
for (let key in localStorage) {

    if (key.startsWith("user_")) {

        let g = JSON.parse(localStorage.getItem(key));

        if (g.role === "group" && (g.isApproved === true || g.isApproved === "true")) {

            candidates.push(g);

        }

    }

}

// ⭐ Sort candidates (same area first)
candidates.sort((a, b) => {

    if (a.address === user.address && b.address !== user.address) return -1;

    if (a.address !== user.address && b.address === user.address) return 1;

    return 0;

});

// Show candidates
candidates.forEach(g => {
                        const card = document.createElement('div');
                        card.className = "party-card";
                        const actionHtml = user.role === "voter"
                            ? `<p class="vote-count">Votes: <span class="vote-number">${g.voteCount || 0}</span></p>
                               <button class="vote-btn" onclick="castVote('${g.mobile}')">Vote</button>`
                            : `<p style="font-weight:bold;">Total Votes: ${g.voteCount || 0}</p>`;
                        const finalPartyName = g.party?.trim() || "Independent";
                        card.innerHTML = `

<div class="circle-box">
    <img src="${g.image}" class="inner-image">
</div>

<div style="flex:1">

    <h2 class="party-name">${g.party}</h2>

    <p class="candidate-name">Candidate: ${g.name}</p>
    <p class="candidate-area">Area: ${g.address}</p>


    

    ${user.role === "voter" ? 
        `<button class="vote-btn" onclick="castVote('${g.mobile}')">Vote</button>`
        : ""
    }

</div>

`;



container.appendChild(card);
                    });
                }
    }
    


    // ===== ADMIN PANEL =====
    if (window.location.pathname.includes("admin.html")) {
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const pendingSection = document.getElementById('pending-section');
        const adminLoginSection = document.getElementById('admin-login-section');
        const pendingContainer = document.getElementById('pending-container');
        const logoutBtn = document.getElementById('logoutAdmin');
        const startVotingBtn = document.getElementById("startVotingBtn");

startVotingBtn?.addEventListener("click", function(){

    if(confirm("Start Voting Now?")){

        localStorage.setItem("electionStarted","true");

        localStorage.setItem("votingStartTime", Date.now());

        alert("Voting Started!");

        window.location.href = "home.html";

    }

});

        const ADMIN_CREDENTIALS = { mobile: "9604870053", password: "admin123" };

        adminLoginBtn?.addEventListener('click', () => {
            const mobile = document.getElementById('adminMobile').value.trim();
const pass = document.getElementById('adminPassword').value.trim();          
  if (mobile === ADMIN_CREDENTIALS.mobile && pass === ADMIN_CREDENTIALS.password) {
                adminLoginSection.style.display = 'none';
                pendingSection.style.display = 'block';
                loadPendingCandidates();
            } else { alert("Invalid admin credentials!"); }
        });

        function loadPendingCandidates() {
            pendingContainer.innerHTML = "";
            for (let key in localStorage) {
                if (key.startsWith("user_")) {
                    const candidate = JSON.parse(localStorage.getItem(key));
                    if (candidate.role === "group" && candidate.isApproved === false) {
                        const card = document.createElement('div');
                        card.className = "party-card";
                        card.innerHTML = `<div class="circle-box">
                     <img src="${candidate.image || 'https://via.placeholder.com/90'}" class="inner-image">
                   </div>
                   <div style="flex:1;text-align:left;">
                     <h3 class="party-name">${typeof candidate.party === "object" ? candidate.party.name : (candidate.party || 'Independent')}</h3>
                     <p class="candidate-name">Candidate: ${candidate.name}</p>
                     
                    
                    ${candidate.nominationDoc ? 
`<p><a href="#" class="doc-link" data-img="${candidate.nominationDoc}" data-type="nomination">View Nomination Letter</a></p>` : ''}
                     <button class="approve-btn" data-mobile="${candidate.mobile}">Approve</button>
                     <button class="reject-btn" data-mobile="${candidate.mobile}">Reject</button>
                   </div>`;

                        
                        pendingContainer.appendChild(card);
                    }
                }
            }
        document.querySelectorAll(".doc-link").forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        openNomination(this.dataset.img);

    });

});

            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mobile = e.target.dataset.mobile;
                    const candidate = JSON.parse(localStorage.getItem("user_" + mobile));
                    candidate.isApproved = true;
candidate.isRejected = false;
candidate.voteCount = candidate.voteCount || 0; // Ensure voteCount exists
                    localStorage.setItem("user_" + mobile, JSON.stringify(candidate));
                    loadPendingCandidates();
                });
            });

            document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {

        const mobile = e.target.dataset.mobile;
        const candidate = JSON.parse(localStorage.getItem("user_" + mobile));

        let reasonChoice = prompt(
`Select Reject Reason:

1 - Aadhaar Card Missing
2 - Nomination Letter Missing
3 - Invalid Documents`
        );

        let reasonMessage = "There is a problem with your documents. Please check and upload again.";

        if (reasonChoice === "1") {
            reasonMessage = "Your Aadhaar Card has not been uploaded.";
        }

        else if (reasonChoice === "2") {
            reasonMessage = "Your Nomination Letter has not been uploaded.";
        }

        else if (reasonChoice === "3") {
            reasonMessage = "Your uploaded documents are invalid.";
        }

        candidate.isRejected = true;
        candidate.rejectReason = reasonMessage;

        localStorage.setItem("user_" + mobile, JSON.stringify(candidate));

        // ⭐ REMOVE CARD IMMEDIATELY
        e.target.closest(".party-card").remove();

    });
});
        }

        logoutBtn?.addEventListener('click', () => {
            pendingSection.style.display = 'none';
            adminLoginSection.style.display = 'block';
            document.getElementById('adminMobile').value = '';
            document.getElementById('adminPassword').value = '';
        });
        
        // ===== AADHAR BACK BUTTON =====
const backBtn = document.getElementById("nominationBackBtn");

if (backBtn) {

    backBtn.addEventListener("click", function () {

        document.getElementById("nomination-view-section").style.display = "none";
        document.getElementById("pending-section").style.display = "block";

    });

}
    }
    

    // ===== RECEIPT PAGE =====
    if (window.location.pathname.includes("receipt.html")) {
        const proof = JSON.parse(localStorage.getItem("voteProof"));
        if (proof) {
            document.getElementById("proofName").innerText = proof.name;
            document.getElementById("proofTxn").innerText = proof.txn;
            document.getElementById("proofDate").innerText = proof.date;
        }
    }
    // ===== RESET PASSWORD PAGE =====
if (window.location.pathname.includes("reset.html")) {

    const sendOtpBtn = document.getElementById("sendResetOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyResetOtpBtn");
    const finalResetBtn = document.getElementById("finalResetBtn");

    const stepMobile = document.getElementById("step-mobile");
    const stepOtp = document.getElementById("step-otp");
    const stepPassword = document.getElementById("step-password");

    let generatedOtp = "";

    // SEND OTP
    sendOtpBtn?.addEventListener("click", function () {
        const mobile = document.getElementById("resetMobile").value.trim();

        if (mobile.length !== 10 || isNaN(mobile)) {
            alert("Enter valid 10-digit mobile number!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user_" + mobile));

        if (!user) {
            alert("Mobile number not registered!");
            return;
        }

        generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

        

        stepMobile.style.display = "none";
        stepOtp.style.display = "block";
        
    });

    // VERIFY OTP
    verifyOtpBtn?.addEventListener("click", function () {
    const enteredOtp = document.getElementById("resetOtpInput").value.trim();

    if (!enteredOtp) {
        alert("Please enter OTP!");
        return;
    }

    // ✅ Accept any OTP
    stepOtp.style.display = "none";
    stepPassword.style.display = "block";
});

    // FINAL RESET
    finalResetBtn?.addEventListener("click", function () {
        const newPass = document.getElementById("newPass").value.trim();
        const confirmNewPass = document.getElementById("confirmNewPass").value.trim();
        const mobile = document.getElementById("resetMobile").value.trim();

        if (!newPass || !confirmNewPass) {
            alert("Please fill both password fields!");
            return;
        }

        if (newPass !== confirmNewPass) {
            alert("Passwords do not match!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user_" + mobile));

        user.password = newPass;
        localStorage.setItem("user_" + mobile, JSON.stringify(user));

        alert("Password updated successfully!");
        window.location.href = "login.html";
    });
}

    // ===== CHECKBOX ENABLE BUTTON =====
    const agree = document.getElementById("agree");
    const btn = document.getElementById("proceedBtn");
    if (agree && btn) {
        agree.addEventListener("change", function() { btn.disabled = !this.checked; });
        btn.addEventListener("click", function() { window.location.href = "login.html"; });
    }
});
// ===== Aadhar Open Function =====
function openNomination(imageSrc) {

    document.getElementById("pending-section").style.display = "none";
    document.getElementById("nomination-view-section").style.display = "block";

    document.getElementById("docTitle").innerText = "Candidate Nomination Letter";

    document.getElementById("nomination-content").innerHTML =
        `<img src="${imageSrc}" alt="Nomination Letter">`;
}
// ===== CONTROLLED VOTING TIMER =====

const timerElement = document.getElementById("timer");

if (timerElement) {

    const electionStarted = localStorage.getItem("electionStarted");

    if (electionStarted === "true") {

        const startTime = localStorage.getItem("votingStartTime");

        const duration = 3 * 60 * 1000; // 2 minutes demo

        const endTime = Number(startTime) + duration;

        const timerInterval = setInterval(() => {

            const now = Date.now();
            const distance = endTime - now;

            if (distance <= 0) {
                clearInterval(timerInterval);
                timerElement.innerHTML = "Voting Closed";
                return;
            }

            const minutes = Math.floor(distance / 60000);
            const seconds = Math.floor((distance % 60000) / 1000);

            timerElement.innerHTML = `${minutes}m ${seconds}s`;

        }, 1000);

    } else {

        timerElement.innerHTML = "Voting Not Started";

    }

}
// ===== VOTER DATABASE (Demo for EPIC Auto Fill) =====

const voterDatabase = {

"ABC1234567": {
name: "Rahul Sharma",
gender: "Male",
age: 28,
area: "Pune-Bhosari",
photo: "images/boy.png"
},

"DEF7654321": {
name: "Priya Patel",
gender: "Female",
age: 25,
area: "Nashik-Shivajinagar",
photo: "images/woman.png"
},

"XYZ8676689": {
name: "Mohan Pawar",
gender: "Male",
age: 19,
area: "Mumbai-Panchavati",
photo: "images/profile.png"
},

"OMN8698989": {
name: "Rupali Gode",
gender: "Female",
age: 60,
area: "Mumbai-Panchavati",
photo: "images/old-woman.png"
},

"LPQ3434008": {
name: "Ankush More",
gender: "Male",
age: 60,
area: "Pune-Nigdi",
photo: "images/grandfather.png"
},
"CKJ2875649": {
name: "Anita Kadam",
gender: "Female",
age: 21,
area: "Pune-Nigdi",
photo: "images/woman (2).png"
}

};


// ===== EPIC AUTO FILL SYSTEM =====

const epicInput = document.getElementById("epicNumber");


if(epicInput){
    epicInput.addEventListener("change", function(){
        const epic = this.value.toUpperCase();
        if(voterDatabase[epic]){
            document.getElementById("voterName").value = voterDatabase[epic].name;
            document.getElementById("voterGender").value = voterDatabase[epic].gender;
            document.getElementById("voterAge").value = voterDatabase[epic].age;
            document.getElementById("voterArea").value = voterDatabase[epic].area;
            document.getElementById("voterPhoto").src = voterDatabase[epic].photo;

            // ✅ Save temp image for circle box
            window.tempUserImage = voterDatabase[epic].photo;
        } else {
            alert("EPIC Number not found in voter database");
        }
    });
}


// ===== SEND OTP BUTTON =====


const sendOtpBtn = document.getElementById("sendOtpBtn");

if(sendOtpBtn){
sendOtpBtn.addEventListener("click",function(){
const epic = document.getElementById("epicNumber").value.trim();
const name = document.getElementById("voterName").value.trim();
const gender = document.getElementById("voterGender").value.trim();
const age = document.getElementById("voterAge").value.trim();
const area = document.getElementById("voterArea").value.trim();
const mobileInput = document.getElementById("voterMobile") || document.getElementById("mobile");
const mobile = mobileInput ? mobileInput.value.trim() : "";
// 🔴 DUPLICATE MOBILE CHECK (VOTER + COMMON)
if(localStorage.getItem("user_" + mobile)){

    const existingUser = JSON.parse(localStorage.getItem("user_" + mobile));

    alert(
        "❌ This mobile number is already registered!\n\n" +
        
        "👉 Please use a different mobile number."
    );

    return; // stop process
}

const pass = document.getElementById("password").value;
const cPass = document.getElementById("confirmPassword").value;
const role = document.getElementById("role")?.value;

if(role === "voter"){

    if(!epic || !name || !mobile || !dob || !pass || !cPass){
        alert("Please fill all fields first!");
        return;
    }

}

if(role === "group"){

    if(!name || !mobile ||  !area || !pass || !cPass){
        alert("Please fill all required fields!");
        return;
    }



}

const countryCode = document.getElementById("countryCode")?.value || "+91";

// Indian mobile pattern
const isIndianNumber = /^[6-9]\d{9}$/.test(mobile);

// +91 case
if(countryCode === "+91" && !isIndianNumber){
    alert("Invalid Indian mobile number!");
    return;
}

// Other country case
if(countryCode !== "+91" && isIndianNumber){
    alert("Invalid mobile number for selected country!");
    return;
}

// basic check
if(mobile.length !== 10 || isNaN(mobile)){
    alert("Enter valid mobile number!");
    return;
}


if(pass !== cPass){

alert("Passwords do not match!");
return;

}


// ✅ SAVE USER DATA
const party = document.getElementById("party")?.value || "";

const userData = {

name: name,
voterId: epic,
mobile: mobile,
password: pass,
role: role || "voter",
address: area,
gender: gender,
age: age,
dob: dob,
party: party,
image: window.tempSymbol || window.tempUserImage,
nominationDoc: window.tempNomination,
voteCount: 0,
isApproved: role === "group" ? false : true,
isRejected: false,
hasVoted: false

};

localStorage.setItem("user_" + mobile, JSON.stringify(userData));
const otp = Math.floor(1000 + Math.random() * 9000);
localStorage.setItem("generatedOTP", otp);
alert("Your OTP is: " + otp);

// start timer
startOtpTimer();

// OTP section show
document.getElementById("registration-section").style.display = "none";
document.getElementById("otp-section").style.display = "block";

});

}
// ===== GROUP REGISTRATION OTP BUTTON FIX =====

const sendRegisterOtpBtn = document.getElementById("sendRegisterOtpBtn");

if(sendRegisterOtpBtn){

sendRegisterOtpBtn.addEventListener("click",function(){
const name = document.getElementById("fullName").value.trim();
const mobile = document.getElementById("mobile").value.trim();
// 🔴 DUPLICATE MOBILE CHECK (GROUP / CANDIDATE)
if(localStorage.getItem("user_" + mobile)){

    const existingUser = JSON.parse(localStorage.getItem("user_" + mobile));

    alert(
        "❌ This mobile number is already registered!\n\n" +
        
        "👉 Please use a different mobile number."
    );

    return; // stop process
}
const area = document.getElementById("voterArea").value.trim();
const pass = document.getElementById("password").value;
const cPass = document.getElementById("confirmPassword").value;

if(!name || !mobile || !area || !pass || !cPass){

alert("Please fill all required fields!");
return;

}

const countryCode = document.getElementById("countryCode")?.value || "+91";

// Indian mobile pattern
const isIndianNumber = /^[6-9]\d{9}$/.test(mobile);

// +91 case
if(countryCode === "+91" && !isIndianNumber){
    alert("Invalid Indian mobile number!");
    return;
}

// Other country case
if(countryCode !== "+91" && isIndianNumber){
    alert("Invalid mobile number for selected country!");
    return;


}

if(pass !== cPass){

alert("Passwords do not match!");
return;

}
const partyVal = document.getElementById("party")?.value || "Independent";
const userData = {

name: name,
mobile: mobile,
password: pass,
role: "group",
address: area,
party: partyVal,
image: window.tempSymbol || window.tempUserImage,
nominationDoc: window.tempNomination,
voteCount: 0,
isApproved: false,
isRejected: false

};

localStorage.setItem("user_" + mobile, JSON.stringify(userData));

// OTP generate
const otp = Math.floor(1000 + Math.random() * 9000);

localStorage.setItem("generatedOTP", otp);

alert("Your OTP is: " + otp);

// show OTP section
document.getElementById("registration-section").style.display = "none";
document.getElementById("otp-section").style.display = "block";
startOtpTimer();   

});

}

function openRegistration() {

    let electionStarted = localStorage.getItem("electionStarted");

    if(electionStarted === "true"){
        window.location.href = "registration1.html";
    }else{
        window.location.href = "registration.html";
    }

}
const verifyBtn = document.getElementById("verifyBtn");

if(verifyBtn){

verifyBtn.addEventListener("click", function(){

    const enteredOtp = document.getElementById("otpInput").value.trim();
    const storedOtp = localStorage.getItem("generatedOTP");

    // 🔴 EMPTY CHECK
    if(!enteredOtp){
        alert("⚠️ Please enter OTP!");
        return;
    }

    // 🔴 WRONG OTP
    if(enteredOtp !== storedOtp){

        alert("❌ Invalid OTP!\n\nPlease enter the correct OTP sent to your mobile.");

        return; // STOP PROCESS
    }

    // ✅ CORRECT OTP
    clearInterval(otpTimerInterval);

    const role = document.getElementById("role")?.value;

    if(role === "group"){

        alert("✅ OTP Verified!\n\nRegistration Successful!\n\nYour request has been sent to Admin for approval.");

    }else{

        alert("✅ OTP Verified!\n\nRegistration Successful! You can login now.");

    }

    // OTP clear (security)
    localStorage.removeItem("generatedOTP");

    window.location.href = "login.html";

});

}
// ===== CANDIDATE NOMINATION DATABASE =====

const nominationDatabase = {

"NOM1001": {
name: "Amit Patil",
gender: "Male",
serial: 1,
party: "Shiv Sena",
constituency: "Pune",
area: "Pune-Bhosari"
},

"NOM1002": {
name: "Sneha Deshmukh",
gender: "Female",
serial: 2,
party: "BJP",
constituency: "Nashik",
area: "Nashik-Shivajinagar"
},

"NOM1003": {
name: "Rahul Jadhav",
gender: "Male",
serial: 3,
party: "Congress",
constituency: "Mumbai",
area: "Mumbai-Panchavati"
},

"NOM1004": {
name: "Rupali More",
gender: "Female",
serial: 4,
party: "BJP",
constituency: "Mumbai",
area: "Mumbai-Panchavati"
},

"NOM1005": {
name: "Prnav Kate",
gender: "Male",
serial: 5,
party: "NCP",
constituency: "Pune",
area: "Pune-Nigdi"
},

"NOM1006": {
name: "Dipali Pansare",
gender: "Female",
serial: 6,
party: "MNS",
constituency: "Pune",
area: "Pune-Nigdi"
}



};

// ===== NOMINATION AUTO FILL SYSTEM =====


const nominationInput = document.getElementById("nominationNumber");

if (nominationInput) {

nominationInput.addEventListener("input", function () {

const nom = this.value.trim().toUpperCase();

if (nominationDatabase[nom]) {

const data = nominationDatabase[nom];

document.getElementById("fullName").value = data.name;
document.getElementById("voterGender").value = data.gender;
document.getElementById("candidateSerial").value = data.serial;
document.getElementById("party").value = data.party;
document.getElementById("constituency").value = data.constituency;
document.getElementById("voterArea").value = data.area;

}

});

}
const resendBtn = document.getElementById("resendOtpBtn");

if(resendBtn){

    resendBtn.addEventListener("click", function(){

        // new OTP generate
        const newOtp = Math.floor(1000 + Math.random() * 9000);

        localStorage.setItem("generatedOTP", newOtp);

        alert("New OTP: " + newOtp);

        // button hide परत
        resendBtn.style.display = "none";

        // timer restart
        clearInterval(otpTimerInterval);
        startOtpTimer();

    });

}