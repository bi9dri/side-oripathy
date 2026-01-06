---
sidebar_position: 5
toc_max_heading_level: 2
---

import Memo from '@site/src/components/memo';

# [Erosion Level]

The **Erosion Level** is a numerical value representing the progression of Oripathy in a character. As it increases, various restrictions are placed on their actions.

Please note that the Erosion Level is a mechanical abstraction created for this TRPG system to express the severity of the disease and is distinct from the "Cell-Originium Assimilation" seen in the original game.

The Erosion Level is categorized into stages as shown in the table below:

<table style={{textAlign: 'left'}}>
  <thead>
    <tr>
      <th style={{minWidth: '6em'}}>Stage</th>
      <th style={{minWidth: '5.5em'}}>Level</th>
      <th>Effect</th>
      <th>Description Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0<br /><b>Uninfected</b></td>
      <td>0</td>
      <td>None</td>
      <td>None</td>
    </tr>
    <tr>
      <td>1<br /><b>Mild</b></td>
      <td>1-20</td>
      <td>
        <ul style={{margin:0}}>
          <li>Physical skill check values -1</li>
        </ul>
      </td>
      <td>
        <ul style={{margin:0}}>
          <li>Slight pain or discomfort at the infection site.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>2<br /><b>Moderate</b></td>
      <td>21-70</td>
      <td>
        <ul style={{margin:0}}>
            <li>Physical skill check values -1</li>
            <li>\<Arts\> skill check values +1</li>
            <li>All other skill check values -1</li>
        </ul>
      </td>
      <td>
        <ul style={{margin:0}}>
          <li>Strong pain and loss of function at the infection site.</li>
          <li>Originium crystals appear on the surface of the skin.</li>
          <li>Physical changes such as swelling of affected body parts.</li>
          <li>Sensing Originium within the body; gaining the feeling of being able to use Arts even without an Arts Unit.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>3<br /><b>Severe</b></td>
      <td>71-90</td>
      <td>
        <ul style={{margin:0}}>
          <li>\<Arts\> skill check values +2</li>
          <li>All other skill check values -2</li>
        </ul>
      </td>
      <td>
        <ul style={{margin:0}}>
          <li>Intense whole-body pain and significant loss of function.</li>
          <li>Certain body parts turn into Originium and become immobile.</li>
          <li>Mental instability, such as hallucinations.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>4<br /><b>Terminal</b></td>
      <td>91-100</td>
      <td>
        <ul style={{margin:0}}>
          <li>Unable to take proactive actions.<ul style={{margin:0}}><li>\<＊生存 (Survival)\> skill and similar checks are still permitted.</li></ul></li>
          <li>**[Originium Erosion Checks]** occur over time.</li>
          <li><u><b>The character is treated as deceased at the end of the session.</b></u></li>
        </ul>
      </td>
      <td>
        <ul style={{margin:0}}>
          <li>Loss of sensation.</li>
          <li>Clouded consciousness.</li>
          <li>Originium crystals covering the entire body.</li>
          <li>Most body parts have turned into Originium and are immobile.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>5<br /><b>Deceased</b></td>
      <td>101+</td>
      <td>
        <ul style={{margin:0}}>
          <li><u><b>Immediate death.</b></u></li>
          <li>Triggers an **[Originium Erosion Check]** for all surrounding characters.</li>
        </ul>
      </td>
      <td>
        <ul style={{margin:0}}>
          <li>The entire body transforms into Originium and "explodes," scattering dust into the surrounding area.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<Memo>
Although Oripathy cruelly erodes the Infected's body, the Ancients still maintain their formidable physical prowess.
</Memo>

----

To facilitate checks involving the Erosion Level, it is convenient to set the following two statuses on your character sheet or session tools: **"Erosion Stage"** and **"Physiological Resistance."**

### Erosion Stage

A classification of the Erosion Level, represented by the values 0-5 as listed in the table.

### Physiological Resistance

Represents the character's resistance to Oripathy, calculated as the sum of their **[身体 (Physique)]** and **[運勢 (Luck)]** attributes. If you wish to create a character whose physical sturdiness does not match their resistance to Oripathy, you may set an arbitrary value between 2 and 12, similar to **[運勢 (Luck)]**.

<Memo>
Physiological Resistance does not depend on **[精神 (Mind)]**. No matter how resilient one's spirit may be, there is no escaping the ruthlessness of Oripathy.
</Memo>

If you wish to reflect the effects of the Erosion Level in CCFOLIA chat palettes or similar tools, you can use the following BCDice commands:

<table>
    <tbody>
        <tr>
            <td>Physical skills</td>
            <td>`{Skill Level}DM<=({Check Value}-({Erosion Stage}*4/5R))`</td>
        </tr>
        <tr>
            <td>\<Arts\> skills</td>
            <td>`{Skill Level}DM<=({Check Value}+(({Erosion Stage}-1)*2/3C))`</td>
        </tr>
        <tr>
            <td>Other skills</td>
            <td>`{Skill Level}DM<=({Check Value}-(({Erosion Stage}-1)*2/3R))`</td>
        </tr>
    </tbody>
</table>

If you want to reflect these changes on an Emoklore TRPG character sheet, the [Converter](/converter) is a useful tool.

Typically, the Erosion Level starts at 0 (Uninfected) during character creation. However, if you are creating an Infected character, you may set an arbitrary starting value.

**The Erosion Level is not reset between sessions; it is carried over.**

## Reducing the Erosion Level

As of the year 1102 in Terra, **Oripathy is an incurable disease. While its progression can be delayed, it cannot be cured.**

However, by administering **Oripathy Suppressants** within approximately one hour of an Erosion Level increase, you can reduce the level by 1D5 (up to the amount of the most recent increase).

**Erosion Level cannot be reduced through \<\*手当て (First Aid)\> or \<医術 (Medicine)\>.**

<Memo>
The quality of Rhodes Island's suppressants is unrivaled. If you rely on other medications, you cannot expect the same level of efficacy.
</Memo>
