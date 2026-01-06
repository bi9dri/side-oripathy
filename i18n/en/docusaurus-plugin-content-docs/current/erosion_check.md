---
sidebar_position: 6
toc_max_heading_level: 2
---

import Expression from '@site/src/components/expression';
import Memo from '@site/src/components/memo';

# [Originium Erosion Check]

The **Originium Erosion Check** determines whether a character's Oripathy progresses (or whether they become infected). The more advanced the Oripathy and the more intense the contact with active Originium, the more likely the disease is to progress.

This system is inspired by the **Resonance Check** in Emoklore TRPG. If you are familiar with the [original rules](https://emoklore.dicetous.com/rulebook/rulebook-dealer/#Dealer-anc5), you will find it quite similar.

A check is defined as follows:

<Expression>
`Originium Erosion Check (Danger Level: 3 / Increase: 1D8)`
</Expression>

### Danger Level

A value specified by the Dealer for each check, similar to the **Strength** of a **Resonance Check**.

The Dealer may lower the Danger Level based on circumstances, such as the character wearing a dust mask or attempting infection prevention via a **\<Medicine\>** skill check.

For details, see the [Danger Level Guidelines](#danger-level-guidelines).

### Increase

A value specified by the Dealer for each check, similar to the **Increase** of a **Resonance Check**.

This value is only used if the number of successes in the Originium Erosion Check is 3 or higher.

## How to Perform the Check

1. Take the **[Erosion Level]**, divide it by **[Physiological Resistance]**, and round down.
2. Add 1 to this result. This is the number of 10-sided dice (D10) you will roll.
3. Compare each die result with the **Danger Level** to determine the number of successes. The total is your final number of successes for the Originium Erosion Check.

Just like skill checks in Emoklore TRPG:
- A roll of **1** yields **2 successes** (Critical).
- A roll **equal to or less than the Danger Level** yields **1 success**.
- A roll of **10** yields **-1 success** (Fumble / Error).

In BCDice command format:

<Expression>
`({Erosion Level}/{Physiological Resistance}F+1)DM<={Danger Level}`
</Expression>

### Outcomes

The character's **Erosion Level** increases based on the number of successes:

|Successes|Increase Amount|
|:--|:--|
|0|No increase|
|1–2|Same as the number of successes|
|3+|The specified **Increase** value (e.g., 1D8)|


### Design Intent

- The number of dice represents the "vulnerability to Originium" caused by the character's condition, while the Danger Level represents the "intensity of Originium influence" in the situation.
- The more Oripathy progresses, the easier it becomes to worsen.
- Stronger physical health or better luck makes it harder to contract or advance the disease.
- The more intense the contact with active Originium, the more severe the impact on Oripathy becomes.
- Just like the Resonance Check in Emoklore TRPG, I wanted to increase the number of dice based on the character's status. After all, rolling a huge handful of dice is part of the fun!
- As long as the initial calculation is done, the process isn't complex, allowing the result to be determined with a single dice roll.


## Examples

### Character with [Physique: 3], [Luck: 6], [Erosion Level: 0] facing Danger Level 2:

1. Physiological Resistance: `3 + 6 = 9`
2. Number of dice: `(0 / 9) + 1 = 1`
3. Danger Level: `2`

Result: `1DM<=2` (Roll 1D10; successes on 2 or less)

### Character with [Physique: 1], [Luck: 2], [Erosion Level: 68] facing Danger Level 4:

1. Physiological Resistance: `1 + 2 = 3`
2. Number of dice: `(68 / 3) + 1 = 23` (rounded down)
3. Danger Level: `4`

Result: `23DM<=4` (Roll 23D10; successes on 4 or less)

<Memo>
The number of dice ranges from 1 to 51. That's a lot of dice to roll!
</Memo>

:::note
## Example Scene

A Resonator (共鳴者; a player character of Emoklore TRPG) named Aether visits an abandoned house in an Infected residential district.

While searching, he finds a strange bag. As he reaches out to check the contents, his hand slips, and the bag drops. Unfortunately, the bag was not fully sealed and contained an Infected corpse; active Originium dust scatters throughout the room.

The Dealer calls for an **[Originium Erosion Check]** due to exposure. Since Aether is wearing Rhodes Island-issued protective gear, the Dealer sets a low Danger Level.

**Originium Erosion Check (Danger Level: 2 / Increase: 1D5)**

Aether's **[Physique]** is 3, **[Luck]** is 4, and **[Erosion Level]** is 10.

Physiological Resistance: `3 + 4 = 7`. Number of dice: `(10 / 7) = 1.42...` (round down to 1) + 1 = **2 dice**.

The player rolls 2D10 and gets **1** and **8**. Since the 1 is a critical (2 successes), the total successes is **2**.

Aether's **[Erosion Level]** increases by 2. He feels a slight pain in the back of his throat and lets out a small groan.
:::

## Danger Level Guidelines

<table>
    <thead>
        <tr>
            <th>Danger Level</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1–2</td>
            <td>**High-risk contact.** Situations where active Originium may be inhaled or absorbed.</td>
        </tr>
        <tr>
            <td>3–5</td>
            <td>**Extremely dangerous contact.** Situations where active Originium easily enters the body.</td>
        </tr>
        <tr>
            <td>6+</td>
            <td>**Fatal contact.** Situations where active Originium aggressively erodes the body.</td>
        </tr>
    </tbody>
</table>

<Memo>
Don't worry. It's rare to contract Oripathy just by touching an Infected person.
</Memo>
