export class TimersManager {
    constructor() {
        this.arrTimers = [];
    }
    // добавляет таймер в очередь на выполнение
    add(timer, ...args) {
        const errors = this._check(timer);
        if (errors) {
            throw new Error(`При добавлении нового таймера произошла ошиюка:\n ${errors}`);
        }

        this.arrTimers = this.arrTimers.concat({ ...timer, args });

        return this;
    }

    // останавливает определенный таймер и удаляет его из очереди
    remove(name) {
        this.pause(name);
        this.arrTimers = this.arrTimers.filter(timer => timer.name !== name);
    }

    // запускает все таймеры на выполнение
    start() {
        const startedTimers = this.arrTimers.some(timer => timer.hasOwnProperty('id'));
        if (startedTimers) {
            throw new Error('Некоторые таймеры уже запущены');
        }
        this.arrTimers = this.arrTimers.map(timer => this.resume(timer.name));
    }

    // останавливает все таймеры
    stop() {
        this.arrTimers = this.arrTimers.map(timer => this.pause(timer.name));
    }

    // останавливает конкретный таймер
    pause(name) {
        const timer = this._get(name);
        timer.interval ? clearInterval(timer.id) : clearTimeout(timer.id);
        delete timer.id;

        return timer;
    }

    // запускает работу конкретного таймера
    resume(name) {
        const timer = this._get(name);

        const callback = () => {
            try {
                timer.job(...timer.args)
            } catch (error) {
                throw new Error('Таймер не существует');
            }
        };

        const timerId = timer.interval ? setInterval(callback, timer.delay) : setTimeout(callback, timer.delay);

        return { id: timerId, ...timer };
    }

    _get(name) {
        const timer = this.arrTimers.find(timer => timer.name === name);
        if (!timer) {
            throw new Error('Таймер не существует');
        }

        return timer;
    }

    _check(timer) {
        return [
            ['name', name => typeof name === 'string', 'Имя таймера должно быть строкой'],
            ['name', name => name !== '', 'Имя таймера не может быть пустым'],
            [
                'name',
                name => !this.arrTimers.some(timer => timer.name === name),
                'Таймер с таким именем уже существует',
            ],
            ['delay', delay => typeof delay === 'number', 'Задержка таймера должна быть числом'],
            ['delay', delay => delay > 0, 'Задержка таймера не может быть меньше 0 мс'],
            ['delay', delay => delay <= 5000, 'Задержка таймера не может быть больше 5000 мс'],
            ['interval', interval => typeof interval === 'boolean', 'Интервал таймера должен быть логическим'],
            ['job', job => typeof job === 'function', 'Работа таймера должна быть функцией'],
        ]
            .filter(([name, validator]) => !validator(timer[name]))
            .map(([, , error]) => error)
            .join('\n');
    }

};
