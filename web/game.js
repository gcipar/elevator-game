class ElevatorGame {
    constructor(playerName = "Player", level = 1) {
        this.playerName = playerName;
        this.level = level;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startButton = document.getElementById('startButton');
        this.resetButton = document.getElementById('resetButton');
        
        // Postavi veličinu canvas-a
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game state
        this.isRunning = false;
        this.score = 0;
        this.lives = 3;
        this.elevatorPosition = 1;
        this.numberOfFloors = 5 + (level - 1) * 2; // Level 1: 5, Level 2: 7, Level 3: 9
        this.floorHeight = this.canvas.height / this.numberOfFloors;
        this.elevatorWidth = 40;
        this.elevatorHeight = this.floorHeight;
        this.passengers = [];
        this.lastPassengerTime = 0;
        this.passengerInterval = 3000 - (level - 1) * 500; // Brže na višim razinama
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Inicijalni crtež
        this.draw();
        this.updateUI();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.floorHeight = this.canvas.height / this.numberOfFloors;
        this.elevatorHeight = this.floorHeight;
    }
    
    startGame() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.textContent = 'Pause';
            this.gameLoop();
        } else {
            this.isRunning = false;
            this.startButton.textContent = 'Start';
        }
    }
    
    resetGame() {
        this.isRunning = false;
        this.score = 0;
        this.lives = 3;
        this.elevatorPosition = 1;
        this.passengers = [];
        this.startButton.textContent = 'Start';
        this.updateUI();
        this.draw();
    }
    
    handleMouseMove(e) {
        if (!this.isRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newFloor = Math.floor((this.canvas.height - y) / this.floorHeight) + 1;
        
        if (newFloor >= 1 && newFloor <= this.numberOfFloors) {
            this.elevatorPosition = newFloor;
        }
    }
    
    updateUI() {
        this.scoreElement.textContent = `${this.playerName}: ${this.score}`;
        this.livesElement.textContent = '❤️'.repeat(this.lives);
    }
    
    spawnPassenger() {
        const now = Date.now();
        if (now - this.lastPassengerTime > this.passengerInterval) {
            const startFloor = Math.floor(Math.random() * this.numberOfFloors) + 1;
            let endFloor;
            do {
                endFloor = Math.floor(Math.random() * this.numberOfFloors) + 1;
            } while (endFloor === startFloor);
            
            this.passengers.push({
                x: 0,
                y: this.canvas.height - (startFloor - 1) * this.floorHeight - this.floorHeight / 2,
                startFloor,
                endFloor,
                isSaved: false,
                isExiting: false
            });
            
            this.lastPassengerTime = now;
        }
    }
    
    updatePassengers() {
        for (let i = this.passengers.length - 1; i >= 0; i--) {
            const passenger = this.passengers[i];
            
            if (!passenger.isSaved) {
                // Putnik se kreće prema liftu
                if (passenger.x < this.canvas.width / 2 - this.elevatorWidth / 2) {
                    passenger.x += 2;
                } else if (Math.abs(this.elevatorPosition - passenger.startFloor) < 0.1) {
                    // Lift je na katu, putnik ulazi
                    passenger.isSaved = true;
                }
            } else if (!passenger.isExiting) {
                // Putnik je u liftu
                if (Math.abs(this.elevatorPosition - passenger.endFloor) < 0.1) {
                    // Lift je na odredišnom katu, putnik izlazi
                    passenger.isExiting = true;
                    this.score += 10;
                    this.updateUI();
                }
            } else {
                // Putnik izlazi
                passenger.x += 2;
                if (passenger.x > this.canvas.width) {
                    this.passengers.splice(i, 1);
                }
            }
        }
    }
    
    draw() {
        // Očisti canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nacrtaj zgradu
        this.ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nacrtaj katove
        for (let i = 0; i <= this.numberOfFloors; i++) {
            const y = this.canvas.height - i * this.floorHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.strokeStyle = 'blue';
            this.ctx.stroke();
        }
        
        // Nacrtaj lift
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(
            this.canvas.width / 2 - this.elevatorWidth / 2,
            this.canvas.height - this.elevatorPosition * this.floorHeight,
            this.elevatorWidth,
            this.elevatorHeight
        );
        
        // Nacrtaj putnike
        this.ctx.fillStyle = 'red';
        for (const passenger of this.passengers) {
            this.ctx.beginPath();
            this.ctx.arc(passenger.x, passenger.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.spawnPassenger();
        this.updatePassengers();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Funkcija za pokretanje igre s imenom i razinom
window.startElevatorGame = function(playerName, level) {
    window.elevatorGame = new ElevatorGame(playerName, level);
};
