import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface NumericControlProps {
    default?: number;
    required?: boolean;
    className?: string;
    onChange(num?: number): void;
}

export default function NumericControl(props: NumericControlProps): JSX.Element {
    const [num, setNum] = useState<string>(props.default === undefined ? '' : props.default.toString());

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        const s = e.target.value.trim();
        if (!/^\d*$/.test(e.target.value))
            return;
        setNum(s);
        props.onChange(s === '' ? undefined : parseInt(s));
    }

    return (
        <Form.Control className={props.className} value={num} required={props.required} onChange={update} />
    );
}