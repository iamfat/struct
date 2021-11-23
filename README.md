# struct
A C-like struct library for buffer parsing and packing

## Usage
```typescript
import { struct, int16_t, uint16_t, uint8_t, LE, UINT16_MAX, INT16_MIN } from '../../lib/struct';

const SENSOR = struct({
    manufacturer: uint16_t,
    version: uint8_t,
    modeAndModel: uint8_t,
    mac: uint8_t[6],
    temperature: LE(int16_t),
    humidity: LE(uint16_t),
    pressure: LE(int16_t),
    flag: uint8_t,
    gasType: uint8_t,
    gasValue: LE(int16_t),
    gasScale: uint8_t,
    adValue: LE(uint16_t),
    battery: uint8_t,
});

const parsed = SENSOR.parse(binaryData);

parsed.humidity = 16;
const newBuf = SENSOR.park(parsed);

```